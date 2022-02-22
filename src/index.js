const _ = require('lodash');
const dot = require('dot-object');

// CONTROLLERS
const GlobalController = require('./controllers/globals');
const BlocksController = require('./controllers/blocks');
const ContractsController = require('./controllers/contracts');
const TxController = require('./controllers/transactions');
const TokensController = require('./controllers/tokens');

// RPC
const { chain } = require('./services/chain');
const { block_store } = require('./services/block_store');

// UTILS
const { logger, timeout } = require('./utils');

let global = new GlobalController();

// Controllers
const CONTROLLERS_FILES = [
  { name: 'blocks', controller: BlocksController },
  { name: 'transactions', controller: TxController },
  { name: 'contracts', controller: ContractsController },
  { name: 'tokens', controller: TokensController },
]


class Tracking {
  constructor() {
    this.head_chain = null;
    this.head_db = null;

    this.block_head
  }

  async load_chain() {
    this.head_chain = await chain.get_head();
    await timeout(10 * 1000);
    this.load_chain();
  }
  
  async load_db() {
    let query_result = await global.getHead();
    let result = {}
    query_result.map(obj => result[obj.name] = obj.value)
    dot.object(result);
    this.head_db = result;
  }

  async sync_db() {
    // auto dispatch until it load the head info of chain rpc
    if(this.head_chain == null || this.head_db == null) {
      await timeout(1000);
      return this.sync_db();
    }
    this.gen_next_block();
  }

  async gen_next_block() {
    let cur_block_num = Number(_.get(this.head_chain, 'head_topology.height', '0'))
    let last_block = Number(_.get(this.head_db, 'head_block', '0'))
    
    // We are 20+ blocks behind!
    if(cur_block_num >= last_block + 20) {
      logger('Streaming is ' + (cur_block_num - last_block) + ' blocks behind!', 1, 'Red');
    }

    while(cur_block_num > last_block) {
      await this.process_block(last_block + 1, cur_block_num);
      last_block += 1;
    }
    // Attempt to load the next block after a 1 second delay (or faster if we're behind and need to catch up)
		setTimeout(() => this.gen_next_block(), 1000);
  }

  async process_block(block_num, cur_block_num) {
    logger(`Processing block [${block_num}], Head Block: ${cur_block_num}, Blocks to head: ${cur_block_num - block_num}`, block_num % 1000 == 0 ? 1 : 4);
    let head_block_id = _.get(this.head_chain, 'head_topology.id', '');
    let result_block
    try {
      result_block = await block_store.get_blocks_by_height(head_block_id, block_num, 1);
    } catch (error) {
      console.log(error)
    }

    let result = _.get(result_block, 'block_items[0]', null);
    if(result) {
      
      // controllers
      let controllersEnabled = process.env.CONTROLLER_ENABLED.split(',');
      console.log(controllersEnabled)
      for (let index = 0; index < controllersEnabled.length; index++) {
        let controllerName = controllersEnabled[index];
        let ctrl = CONTROLLERS_FILES.find(ctrl => ctrl.name == controllerName);
        let ControllerFinal = _.get(ctrl, 'controller', undefined);
        if(ControllerFinal) {
          let controller = new ControllerFinal();
          await controller.process_block(result);
        }
      }

      // update db
      await global.setHead(block_num)
    }
  }
  
  async run() {
    logger('staring', 'Green')
    await this.load_chain();
    await this.load_db();
    await this.sync_db();
  }
}

const tracking = new Tracking();

module.exports = tracking;