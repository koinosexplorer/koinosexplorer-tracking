const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: ContractsModel } = require('./../models/ContractsModel');
const { logger } = require('./../utils');
const { txSerializer, txSigner } = require('./../helpers/koilib');
const { utils: UtilsKoilib } = require('koilib');

// helpers
const _ = require('lodash')

class ContractsController extends Controller {
  constructor() {
    super({ model: ContractsModel, knex: KnexPool, prefix: 'contracts' })
  }
  async processBlock(data) {
    const block = _.get(data, 'block', {});
    const transactions = _.get(block, 'transactions', []);

    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction = transactions[index];
          let transaction_id = _.get(transaction, 'id', '');
          let caller = await txSigner(transaction);
          // decerializer active transaction
          transaction.active = await txSerializer.deserialize(transaction.active);

          // check operations
          if(transaction.active.operations) {
            let operations = transaction.active.operations;
            for (let index = 0; index < operations.length; index++) {
              let operation = operations[index];
              let operation_type = _.head(Object.keys(operation));
              // console.log(operation_type);

              if(operation_type == 'upload_contract') {
                let data = {
                  contract_id: "",
                  address_upload: caller,
                  transactions_upload: transaction_id
                }
                if(_.get(operation, `${operation_type}.contract_id`, false)) {
                  data.contract_id = UtilsKoilib.encodeBase58(operation[operation_type].contract_id);
                }
                
                let querySelect = this.singleQuery();
                querySelect.where('contract_id', data.contract_id);
                querySelect.then(async (contractExist) => {
                  let query = this.singleQuery();
                  console.log(contractExist)   
                  if(contractExist.length == 0) {
                    await query.insert(data);
                  } else {
                    await query.update(data).where('contract_id', data.contract_id);
                  }
                })


              }
            }
          }

        } catch (error) {
          logger('controller contracts', 'Blue')
          logger(error.message, 'Red');
          console.log(data);
          process.exit();
        }
      }
    }
  }
}

module.exports = ContractsController