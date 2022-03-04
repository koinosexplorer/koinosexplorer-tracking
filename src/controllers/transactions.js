const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TxModel } = require('./../models/TransactionsModel');
const { logger } = require('./../utils');
const { txSerializer } = require('./../helpers/koilib');
const { utils: UtilsKoilib } = require('koilib');

// helpers
const _ = require('lodash');

class TxController extends Controller {
  constructor() {
    super({ model: TxModel, knex: KnexPool, prefix: 'transactions' })
  }
  async processBlock(data) {
    // decerilicer
    const block = _.get(data, 'block', {});

    const block_num = _.get(block, 'header.height', '0');
    const transactions = _.get(block, 'transactions', []);


    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction = transactions[index];
          let transaction_id = _.get(transaction, 'id', '');
          let caller = await this.getSigner(transaction);
          let data = {
            transaction_id: transaction_id,
            caller: caller,
            block_num: block_num,
            operations: 0,
          };

          // decerializer active transaction
          transaction.active = await txSerializer.deserialize(transaction.active);

          // set number operations
          let operations
          if(transaction.active.operations) {
            operations = transaction.active.operations;
            data.operations = transaction.active.operations.length
            delete transaction.active.operations
          }
          
          // save transaction
          let query = this.singleQuery();          
          await query.insert(data);

          // save operations
          let opFinal = []
          for (let index = 0; index < operations.length; index++) {
            let operation = operations[index];
            let operation_type = _.head(Object.keys(operation));
            if(operation_type) {
              let contract_id
              if(_.get(operation, `${operation_type}.contract_id`, false)) {
                contract_id = UtilsKoilib.encodeBase58(operation[operation_type].contract_id);
              }
              operation = _.get(operation, `${operation_type}`, {});
              Object.keys(operation).map((k) => { operation[k] = UtilsKoilib.encodeBase64(operation[k]) });
              operation = JSON.stringify(operation);
              opFinal.push({ operation_type, contract_id, operation, order: index })
            } else {
              operation = JSON.stringify(operation);
              opFinal.push({ operation_type: '', contract_id: '', operation })
            }
          }
          let queryRelationOperations = this.relationalQuery("transactions_operations");
          await queryRelationOperations.for(transaction_id).insert(opFinal);
  
          // save metadata
          let metadata = this.metadata(transaction);
          let queryRelationMetaData = this.relationalQuery("transactions_metadata");
          await queryRelationMetaData.for(transaction_id).insert(metadata);
        } catch (error) {
          logger(error.message, 'Red');
        }
      }
    }

  }
}

module.exports = TxController;