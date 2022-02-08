const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TxModel } = require('./../models/TransactionsModel');
const { logger } = require('./../utils');

// helpers
const _ = require('lodash');

class TxController extends Controller {
  constructor() {
    super({ model: TxModel, knex: KnexPool, prefix: 'transactions' })
  }
  async process_block(block) {
    const block_num = _.get(block, 'block.header.height', '0');
    const transactions = _.get(block, 'block.transactions', []);

    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction = transactions[index];
          let transaction_id = _.get(transaction, 'id', '');
          let signer = await this.getSigner(transaction);
          let query = this.singleQuery();
          let data = {
            transaction_id: transaction_id,
            caller: signer,
            block_num: block_num,
            operation: '',
            contract_id: ''
          };
          await query.insert(data);
  
          // save metadata
          let metadata = this.metadata(transaction);
          let queryRelation = this.relationalQuery("transactions_metadata");
          await queryRelation.for(transaction_id).insert(metadata);
        } catch (error) {
          logger(error.message, 'Red');
        }
      }
    }

  }
}

module.exports = TxController;