const { chain } = require('./../services/chain');
const KRC20 = require('./../protos/koinos/contracts/token/token_pb');

class Token {
  static async getInfo(contract_id) {
    let name, symbol, decimals;
    try {
      let r_name = await chain.getReadContract(contract_id, 0x82a3537f, "");
      let r_symbol = await chain.getReadContract(contract_id, 0xb76a7ca1, "");
      let r_decimals = await chain.getReadContract(contract_id, 0xee80fd2f, "");
      name = KRC20.name_result.deserializeBinary(r_name.result).getValue()
      symbol = KRC20.symbol_result.deserializeBinary(r_symbol.result).getValue()
      decimals = KRC20.decimals_result.deserializeBinary(r_decimals.result).getValue()
      return { name, symbol, decimals }
    } catch (error) {
      return null;
    }
  }
  static transferEvent(data) {
    try {
      let transfer_event = KRC20.transfer_event.deserializeBinary(data);
      let from = transfer_event.getFrom();
      let to = transfer_event.getTo();
      let value = transfer_event.getValue();
      return { from, to, value };
    } catch (error) {
      return null;
    }
  }
  static mintEvent(data) {
    try {
      let mint_event = KRC20.mint_event.deserializeBinary(data);
      let to = mint_event.getTo();
      let value = mint_event.getValue();
      return { to, value };
    } catch (error) {
      return null;
    }
  }
}

module.exports = {
  Token
}