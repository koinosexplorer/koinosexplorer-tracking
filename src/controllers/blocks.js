const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: BlocksModel } = require('./../models/BlocksModel');
const { logger } = require('./../utils');
const { blockSerializer, blockSigner } = require('./../helpers/koilib');

// helpers
const _ = require('lodash');

class BlockController extends Controller {
  constructor() {
    super({ model: BlocksModel, knex: KnexPool, prefix: 'block' })
  }
  async processBlock(data) {
    try {
      let block = _.omit(_.get(data, 'block'), [ "transactions" ]);
      let receipts = _.get(data, 'receipt', {});
      let producer = _.get(block, 'header.signer', '');
      
      let query = this.singleQuery();
      let block_num = Number(_.get(block, 'header.height'));
      await query.insert({ block_num: block_num, producer: producer });
      
      // save metadata
      let metadata = this.processData(block);
      let queryRelationMetaData = this.relationalQuery("blocks_metadata");
      await queryRelationMetaData.for(block_num).insert(metadata);

      // save receipt
      let receipt = this.processData(receipts);
      let queryRelationReceipts = this.relationalQuery("blocks_receipts");
      await queryRelationReceipts.for(block_num).insert(receipt);

    } catch (error) {
      logger('controller blocks', 'Blue')
      logger(error.message, 'Red');
      console.log(data);
      process.exit();
    }
  }
}

module.exports = BlockController
