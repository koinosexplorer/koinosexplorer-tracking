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
      
      // decerializer active block
      block.active = await blockSerializer.deserialize(block.active);

      let producer = await blockSigner(block.active);
      let query = this.singleQuery();
      let block_num = _.get(block, 'header.height');
      await query.insert({ block_num: block_num, producer: producer });
      
      // save metadata
      let metadata = this.metadata(block);
      let queryRelation = this.relationalQuery("blocks_metadata");
      await queryRelation.for(block_num).insert(metadata);
    } catch (error) {
      logger('controller blocks', 'Blue')
      logger(error.message, 'Red');
      console.log(data);
      process.exit();
    }
  }
}

module.exports = BlockController