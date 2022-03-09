const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TxModel } = require('./../models/TransactionsModel');
const { logger } = require('./../utils');
const { txSerializer, txSigner } = require('./../helpers/koilib');
const { utils: UtilsKoilib } = require('koilib');

// helpers
const _ = require('lodash');

class TxController extends Controller {
  constructor() {
    super({ model: TxModel, knex: KnexPool, prefix: 'transactions' })
  }
  async processBlock(data) {
    const _block = _.get(data, 'block', {});
    const _receipts = _.get(data, 'receipt', {});


    const block_num = _.get(_block, 'header.height', '0');
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
          let metadata = this.processData(transaction);
          let queryRelationMetaData = this.relationalQuery("transactions_metadata");
          await queryRelationMetaData.for(transaction_id).insert(metadata);

          // save receipt
          let receiptData = this.processData(receipt);
          let queryRelationReceipts = this.relationalQuery("transactions_receipts");
          await queryRelationReceipts.for(transaction_id).insert(receiptData);

          
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