const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: BlocksModel } = require('./../models/BlocksModel');
const { logger } = require('./../utils');

// helpers
const _ = require('lodash');

class BlockController extends Controller {
  constructor() {
    super({ model: BlocksModel, knex: KnexPool, prefix: 'block' })
  }
  async processBlock(data) {
    try {
      let block = _.omit(_.get(data, 'block'), [ "transactions" ]);
      let receipts = _.omit(_.get(data, 'receipt', {}), [ "transaction_receipts" ]);
      let producer = _.get(block, 'header.signer', '');
      
      let query = this.singleQuery();
      let block_num = Number(_.get(block, 'header.height'));
      await query.insert({ block_num: block_num, producer: producer });
      
      // // save metadata
      let _metadata = this.processData(block);
      for (let index = 0; index < _metadata.length; index++) {
        let metadata = _metadata[index];
        let queryRelationMetaData = this.relationalQuery("blocks_metadata");
        await queryRelationMetaData.for(block_num).insert(metadata);
      }


      // // save receipt
      let _receipts = this.processData(receipts);
      for (let index = 0; index < _receipts.length; index++) {
        let receipt = _receipts[index];
        let queryRelationReceipts = this.relationalQuery("blocks_receipts");
        await queryRelationReceipts.for(block_num).insert(receipt);
      }

    } catch (error) {
      logger('controller blocks', 'Blue')
      logger(error.message, 'Red');
      console.log(data);
      process.exit();
    }
  }
}

module.exports = BlockController
