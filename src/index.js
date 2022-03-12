const _ = require('lodash');
const dot = require('dot-object');

// CONTROLLERS
const GlobalController = require('./controllers/globals');
const BlocksController = require('./controllers/blocks');
const ContractsController = require('./controllers/contracts');
const TxController = require('./controllers/transactions');
const TokensController = require('./controllers/tokens');

// RPC
const { chain: chainrpc } = require('./services/chain');
const { block: blockrpc } = require('./services/blockStore');

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
const MAX_NB_BLOCKS_TO_FETCH = 10;

class Tracking {
  constructor() {
    this.headChain = null;
    this.headDB = null;

    // data
    this.lastBlock = null;
    this.curBlockNum = null;
  }

  async loadChain() {
    this.headChain = await chainrpc.getHead();
    this.curBlockNum = Number(_.get(this.headChain, 'head_topology.height', '0'));
    await timeout(30 * 1000);
    this.loadChain();
  }
  
  async loadDB() {
    let query_result = await global.getHead();
    let result = {}
    query_result.map(obj => result[obj.name] = obj.value)
    dot.object(result);
    this.headDB = result;
    this.lastBlock = Number(_.get(this.headDB, 'head_block', '0'));
  }

  async syncDB() {
    if(this.headChain == null || this.headDB == null) {
      await timeout(1000);
      return this.syncDB();
    }
    // pre blocks
    this.genNextBlock();
  }

  async genNextBlock() {

    // We are 20+ blocks behind!
    if(this.curBlockNum >= this.lastBlock + 20) {
      logger('streaming is ' + (this.curBlockNum - this.lastBlock) + ' blocks behind!', 1, 'Red');
    }

    while(this.curBlockNum > this.lastBlock) {
      await this.processBlock(this.lastBlock + 1, this.curBlockNum);
    }
    // Attempt to load the next block after a 1 second delay (or faster if we're behind and need to catch up)
    await timeout(1000);
    this.genNextBlock()
  }

  async processBlock(blockNum, curBlockNum) {
    let blocksToFetch = Math.min(curBlockNum - blockNum, MAX_NB_BLOCKS_TO_FETCH);
    let resultBlocks
    try {
      let _resultBlocks = await blockrpc.getBlocks(
        _.get(this.headChain, 'head_topology.id', ''),
        blockNum,
        blocksToFetch > 0 ? blocksToFetch : 1
      )
      resultBlocks = _.get(_resultBlocks, 'block_items', [])
    } catch (error) {
      console.log(error)
      await timeout(1000);
      return this.processBlock(blockNum, curBlockNum)
    }
    if(!resultBlocks) return;

    let initBlock = _.head(resultBlocks);
    let lastBlock = _.last(resultBlocks);
    logger(`Processing block [ ${resultBlocks.length>1 ? initBlock.block_height+" -> "+ lastBlock.block_height : initBlock.block_height } ], Head Block: ${curBlockNum}`);

    for (let index = 0; index < resultBlocks.length; index++) {
      
      let block = resultBlocks[index];
      const controllersEnabled = process.env.CONTROLLER_ENABLED.split(',');
      for (let index = 0; index < controllersEnabled.length; index++) {
        let controllerName = controllersEnabled[index];
        let ctrl = CONTROLLERS_FILES.find(ctrl => ctrl.name == controllerName);
        let ControllerFinal = _.get(ctrl, 'controller', undefined);
        if(ControllerFinal) {
          let controller = new ControllerFinal();
          // clone the block to avoid problems with the deserializer
          await controller.processBlock(_.cloneDeep(block));
        }
        // save new block
        await this.saveLastBlock( Number(block.block_height) );
      }

    }
  }

  async saveLastBlock(lastBlockNum) {
    await global.setHead(lastBlockNum)
    this.lastBlock = lastBlockNum;
  }
  
  async run() {
    logger('staring', 'Green')
    await this.loadChain();
    await this.loadDB();
    await this.syncDB();
  }
}

const tracking = new Tracking();

module.exports = tracking;