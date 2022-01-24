const { Request } = require('./request');

class Mempool extends Request {
  constructor() {
    super(process.env.RPC_NODE);
  }
}

const mempool = new Mempool();

module.exports = { mempool }