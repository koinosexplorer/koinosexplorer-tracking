const { Request } = require('./request');
const ProtoChain = require('./../proto/rpc/chain/chain_rpc_pb');

class Chain extends Request {
  constructor() {
    super(process.env.RPC_NODE);
  }

  get_head() {
    let message = new ProtoChain.get_head_info_request()
    let data = message.toObject()
    return this.send("chain.get_head_info", data);
  }
  get_chain_id() {
    let message = new ProtoChain.get_chain_id_request()
    let data = message.toObject()
    return this.send("chain.get_chain_id", data);
  }
  
}

const chain = new Chain();

module.exports = { chain }