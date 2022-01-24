const { Request } = require('./request');

class BlockStore extends Request {
  constructor() {
    super(process.env.RPC_NODE);
  }

  get_blocks_by_id(block_ids) {
    let data = {
      block_id: block_ids,
      return_block_blob:true,
      return_receipt_blob:true
    };
    return this.send("block_store.get_blocks_by_id", data);
  }

  get_blocks_by_height(head_block_id, block_height, num_blocks = 1) {
    let data = {
      head_block_id: head_block_id,
      ancestor_start_height: block_height,
      num_blocks:     num_blocks,
      return_block:   true,
      return_receipt: false
    };
    console.log(data)
    return this.send("block_store.get_blocks_by_height", data);
  }

  get_transactions_by_id(tx_ids = []) {
    let data = {
      transaction_ids: [ tx_ids ],
    };
    console.log(data)
    return this.send("block_store.get_transactions_by_id", data);
  }
}

const block_store = new BlockStore();

module.exports = { block_store }