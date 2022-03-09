const ProtoChain = require('./../protos/koinos/rpc/chain/chain_rpc_pb');
const { Request: JSONRequest } = require('./request');

class Chain extends JSONRequest {
  constructor() {
    super(process.env.RPC_NODE);
  }

  getHead() {
    let message = new ProtoChain.get_head_info_request()
    let data = message.toObject()
    return this.send("chain.get_head_info", data);
  }
  
  getContract(contract_id, entry_point, args) {
    let message = new ProtoChain.read_contract_request();
    message.setContractId(contract_id)
    message.setEntryPoint(entry_point)
    message.setArgs(args)
    let data = message.toObject()
    return this.send("chain.read_contract", data);
  }
}

let chain = new Chain();

module.exports = { chain: chain }