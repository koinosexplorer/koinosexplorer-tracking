const ProtoBlockStore = require('./../protos/koinos/rpc/block_store/block_store_rpc_pb');
const { Request: JSONRequest } = require('./request');

class BlockStore extends JSONRequest {
  constructor() {
    super(process.env.RPC_NODE.split(","));
  }

  getBlocks(head_block_id, block_height, num_blocks = 1) {
    let message = new ProtoBlockStore.get_blocks_by_height_request()
    message.setHeadBlockId(head_block_id)
    message.setAncestorStartHeight(block_height)
    message.setNumBlocks(num_blocks)
    message.setReturnBlock(true)
    message.setReturnReceipt(true)
    let data = message.toObject()
    return this.send("block_store.get_blocks_by_height", data);
  }

}

let blockStore = new BlockStore();

module.exports = { block: blockStore }