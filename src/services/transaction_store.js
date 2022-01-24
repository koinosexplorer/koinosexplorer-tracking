const { Request } = require('./request');
const ProtoTx = require('./../proto/rpc/transaction_store/transaction_store_rpc_pb');

class TransactionStore extends JSONRequest {
  constructor() {
    super(process.env.RPC_NODE);
  }

  get_transactions_by_id(ids = []) {
    let message = new ProtoTx.get_transactions_by_id_request()
    message.setTransactionIdsList(ids)
    let data = message.toObject()
    return this.send("transaction_store.get_transactions_by_id", data);
  }
  
}

const transaction_store = new TransactionStore();

module.exports = { transaction_store }