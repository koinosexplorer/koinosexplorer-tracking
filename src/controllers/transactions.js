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
  async processBlock(data) {
    const _block = _.get(data, 'block', {});
    const _receipts = _.get(data, 'receipt', {});


    const block_num =  Number(_.get(_block, 'header.height', '0'));
    const transactions = _.get(_block, 'transactions', []);
    const receipts = _.get(_receipts, 'transaction_receipts', []);

    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction_id = _.get(transactions[index], 'id', '');
          let transaction = transactions[index];
          let receipt = receipts.find(r => r.id == transaction_id);

          let caller = ""//await txSigner(transaction);
          let payer = _.get(transaction, 'header.payer', '');
          let data = {
            transaction_id: transaction_id,
            caller: caller,
            payer: payer,
            block_num: block_num,
          };
          
          // // save transaction
          let query = this.singleQuery();
          await query.insert(data);
  
          // save metadata
          let _metadata = this.processData(transaction);
          for (let index = 0; index < _metadata.length; index++) {
            let metadata = _metadata[index];
            let queryRelationMetaData = this.relationalQuery("transactions_metadata");
            await queryRelationMetaData.for(transaction_id).insert(metadata);
          }

          // save receipt
          let _receiptData = this.processData(receipt);
          for (let index = 0; index < _receiptData.length; index++) {
            let receiptData = _receiptData[index];
            let queryRelationReceipts = this.relationalQuery("transactions_receipts");
            await queryRelationReceipts.for(transaction_id).insert(receiptData);
          }


          
        } catch (error) {
          logger('controller tx', 'Blue')
          logger(error.message, 'Red');
          console.log(data);
        }
      }
    }

  }
}

module.exports = TxController;