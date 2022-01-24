const { Request } = require('./request');

class Chain extends Request {
  constructor() {
    super(process.env.RPC_NODE);
  }

  get_head() {
    let data = {};
    return this.send("chain.get_head_info", data);
  }
  get_chain_id() {
    let data = {};
    return this.send("chain.get_chain_id", data);
  }
  
  get_contract(contract_id, entry_point, args) {
    let data = {
      contract_id: contract_id,
      entry_point: entry_point,
      args: args
    };
    return this.send("chain.read_contract", data);
  }

  get_account_nonce(account) {
    let data = {
      account: account,
    };
    return this.send("chain.get_account_nonce", data);

  }
}

const chain = new Chain();

module.exports = { chain }