const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: BlocksModel } = require('./../models/BlocksModel');

// helpers
const _ = require('lodash');

class BlockController extends Controller {
  constructor() {
    super({ model: BlocksModel, knex: KnexPool, prefix: 'block' })
  }
  async process_block(data) {
    let block = _.omit(_.get(data, 'block'), [ "transactions" ]);
    let query = this.singleQuery();
    let producer = await this.getSigner( block );
    let block_num = _.get(block, 'header.height');
    await query.insert({ block_num: block_num, producer: producer });
    
    // save metadata
    let metadata = this.metadata(block);
    let queryRelation = this.relationalQuery("blocks_metadata");
    await queryRelation.for(block_num).insert(metadata);
  }
}

module.exports = BlockController