const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: BlocksModel } = require('./../models/BlocksModel');
const { logger } = require('./../utils');
const { blockSerializer } = require('./../helpers/koilib');

// helpers
const _ = require('lodash');

class BlockController extends Controller {
  constructor() {
    super({ model: BlocksModel, knex: KnexPool, prefix: 'block' })
  }
  async processBlock(data) {
    try {
      let block = _.omit(_.get(data, 'block'), [ "transactions" ]);
      let producer = await this.getSigner(block);
      
      // decerializer active block
      block.active = await blockSerializer.deserialize(block.active);

      let query = this.singleQuery();
      let block_num = _.get(block, 'header.height');
      await query.insert({ block_num: block_num, producer: producer });
      
      // save metadata
      let metadata = this.metadata(block);
      let queryRelation = this.relationalQuery("blocks_metadata");
      await queryRelation.for(block_num).insert(metadata);
    } catch (error) {
      logger(error.message, 'Red');
    }
  }
}

module.exports = BlockController