const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');
const { logger } = require('./../utils');
const { Token } = require('./../helpers/contract');
const bs58 = require('bs58');

// helpers
const _ = require('lodash');

class TokensController extends Controller {
  constructor() {
    super({ model: TokensModel, knex: KnexPool, prefix: 'tokens' })
  }
  async processBlock(data) {
    const _block = _.get(data, 'block', {});
    const _receipts = _.get(data, 'receipt', {});

    const block_num = Number(_.get(_block, 'header.height'));
    const transactions = _.get(_block, 'transactions', []);
    const receipts = _.get(_receipts, 'transaction_receipts', []);

    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction = transactions[index];
          let transaction_id = _.get(transaction, 'id', '');

          // check operations
          if(transaction.operations.length) {
            let operations = transaction.operations;
            for (let index = 0; index < operations.length; index++) {
              let operation = operations[index];
              let operation_type = _.head(Object.keys(operation));
              if(operation_type == 'upload_contract') {
                // OPERATION UPLOAD CONTRACT
                let contractId = _.get(operation, 'upload_contract.contract_id');
                try {
                  let tokenInfo = await Token.getInfo(contractId);
                  if(tokenInfo) {
                    let tokenFinal = {
                      token_id: contractId,
                      name: typeof tokenInfo.name == 'string' ? tokenInfo.name : tokenInfo.name.toString(),
                      symbol: typeof tokenInfo.symbol == 'string' ? tokenInfo.symbol : tokenInfo.symbol.toString(),
                      decimals: typeof tokenInfo.decimals == 'string' ? tokenInfo.decimals : tokenInfo.decimals.toString(),
                      // relations
                      block_num: block_num,
                      transaction_id: transaction_id,
                      contract_id: contractId
                    }
                    let querySelect = this.singleQuery();
                    querySelect.where('token_id', contractId);
                    querySelect.then(async (contractExist) => {
                      let query = this.singleQuery();          
                      if(contractExist.length == 0) {
                        await query.insert(tokenFinal);
                      } else {
                        await query.update(tokenFinal).where('token_id', contractId);
                      }
                      return;
                    })
                  }

                } catch (error) { /* CONTRACT NOT KRC20 */ }
              }
            }
          }

        } catch (error) {
          logger('controller tokens transactions', 'Blue')
          logger(error.message, 'Red');
          console.log(data);
          process.exit();
        }
      }
    }

    if(receipts.length) {

      for (let iReceipts = 0; iReceipts < receipts.length; iReceipts++) {
        try {
          let receipt = receipts[iReceipts];
          let transaction_id = _.get(receipt, 'id', '');
          // check events
          if(receipt.events && receipt.events.length) {
            
            let events = receipt.events;
            for (let iEvents = 0; iEvents < events.length; iEvents++) {
              let event = events[iEvents];

              // event
              let name = _.get(event, 'name', null);
              let data = _.get(event, 'data', null);
              let source = _.get(event, 'source', null);
              
              let contractExist = await this.singleQuery().where('token_id', source);
              if(contractExist && contractExist.length > 0) {
  
                // transfer event
                try {
                  let _transferEvent = Token.transferEvent(data);
                  if(_transferEvent) {
                    let transfer = {
                      operation: name,
                      from: bs58.encode(_transferEvent.from),
                      to: bs58.encode(_transferEvent.to),
                      value: _transferEvent.value,
                      token_id: source,
                      transaction_id: transaction_id
                    }
                    let queryRelationTokensTx = this.relationalQuery("tokens_transactions");
                    await queryRelationTokensTx.for(source).insert(transfer);
                  }
                } catch (error) { /* not is transfer event*/ }
  
  
              }
  
  
            }
  
          }     
        } catch (error) {
          logger('controller tokens receipts', 'Blue')
          logger(error.message, 'Red');
          console.log(data);
          process.exit();
        }
      }
    }
  }

}

module.exports = TokensController;