const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: GlobalsModel } = require('./../models/GlobalsModel');

class GlobalsController extends Controller {
  constructor() {
    super({ model: GlobalsModel, knex: KnexPool, prefix: 'global' })
  }
  getHead() {
    let query = this.singleQuery();
    return query;
  }
  setHead(block_head) {
    let query = this.singleQuery();
    query.findById("head_block");
    query.patch({ value: String(block_head) })
    return query;
  }
}

module.exports = GlobalsController