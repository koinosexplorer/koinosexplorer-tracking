const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: ContractsModel } = require('./../models/ContractsModel');
const { logger } = require('./../utils');

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
          let caller = _.get(transaction, 'header.payer', '');

          // check operations
          if(transaction.operations) {
            let operations = transaction.operations;
            for (let index = 0; index < operations.length; index++) {
              let operation = operations[index];
              let operation_type = _.head(Object.keys(operation));

              if(operation_type == 'upload_contract') {
                let contract_id = _.get(operation, 'upload_contract.contract_id');
                let data = {
                  contract_id: contract_id,
                  address_upload: caller,
                  transactions_upload: transaction_id
                }
                let querySelect = this.singleQuery().where('contract_id', contract_id)
                querySelect.then(async (contractExist) => {
                  let query = this.singleQuery();
                  if(contractExist.length == 0) {
                    await query.insert(data);
                  } else {
                    await query.update(data).where('contract_id', contract_id);
                  }
                  return;
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