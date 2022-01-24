// CONTROLLERS
const { config_controller } = require('./controllers/config');
const { block_controller } = require('./controllers/block');
const { transaction_controller } = require('./controllers/transaction');
const { contract_controller } = require('./controllers/contract');

// RPC
const { chain } = require('./services/chain');
const { block_store } = require('./services/block_store');

// DB
const ConfigsModel = require("./models/configs");

// UTILS
const { logger, timeout } = require('./utils');
const _ = require('lodash')

class Tracking {
  constructor() {
    this.head_chain = null;
    this.head_db = null;
  }

  async load_chain() {
    this.head_chain = await chain.get_head();
    await timeout(10 * 1000);
    this.load_chain();
  }
  
  async load_db() {
    let _head_db = await ConfigsModel.query().findById('head_block');
    this.head_db = _.get(_head_db, 'value', '{}') != '{}' ? JSON.parse(_.get(_head_db, 'value', 0)) : {};
  }

  async sync_db() {
    // auto dispatch until it load the head info of chain rpc
    if(this.head_chain == null && this.head_db == null) {
      await timeout(1000);
      return this.sync_db();
    }
    
    // check if the chain block is the same as the db block
    let chain_height_block = _.get(this.head_chain, 'head_topology.height', 0);
    let db_height_block = _.get(this.head_db, 'head_topology.height', 5);
    let diffBlocks = chain_height_block - db_height_block;
    
  }
  
  async run() {
    await this.load_chain();
    await this.load_db();
    await this.sync_db();
  }
}

const tracking = new Tracking();

module.exports = tracking;