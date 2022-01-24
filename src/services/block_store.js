const { Request } = require('./request');
const ProtoBlockStore = require('../proto/rpc/block_store/block_store_rpc_pb');

class BlockStore extends Request {
  constructor() {
    super(process.env.RPC_NODE);
  }

  get_blocks_by_id(block_ids) {
    let message = new ProtoBlockStore.get_blocks_by_id_request({
      blockId: block_ids,
      returnBlock: true,
      returnReceipt: true
    })
    let data = message.toObject()
    return this.send("block_store.get_blocks_by_id", data);
  }

  get_blocks_by_height(head_block_id, block_height, num_blocks = 1) {
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

const block_store = new BlockStore();

module.exports = { block_store }