const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');
const { Model: TokensHolders } = require('./../models/TokensHolders');
const { logger } = require('./../utils');
const { Token } = require('./../helpers/contract');
const bs58 = require('bs58');
const BigNumber = require('big-number');

// helpers
const _ = require('lodash');

class TokensController extends Controller {
  constructor() {
    super({ model: TokensModel, knex: KnexPool, prefix: 'tokens' })

    this.modelHolder = TokensHolders.bindKnex(KnexPool);
  }
  async processBlock(data) {
    const _block = _.get(data, 'block', {});
    const _receipts = _.get(data, 'receipt', {});

    const block_num = Number(_.get(_block, 'header.height'));
    const transactions = _.get(_block, 'transactions', []);
    const receipts = _.get(_receipts, 'transaction_receipts', []);
    const receiptsBlock = _.get(_receipts, 'events', []);

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

    if(receiptsBlock.length) {

      for (let bEvents = 0; bEvents < receiptsBlock.length; bEvents++) {
        let event = receiptsBlock[bEvents];

        // event
        let data = _.get(event, 'data', null);
        let source = _.get(event, 'source', null);
        let contractExist = await this.singleQuery().where('token_id', source);
        if(contractExist && contractExist.length > 0) {

          // Mint event
          try {
            let _mintEvent = Token.mintEvent(data);
            if(_mintEvent) {
              let to = bs58.encode(_mintEvent.to);
              let value = _mintEvent.value;
              let queryRelationTokensSystem = await this.relationalQuery("tokens_holders").for(source).findOne({ 'holder': to });
              if(queryRelationTokensSystem) {
                let newAmount = new BigNumber(queryRelationTokensSystem.amount).plus(value).toString();
                await this.relationalQuery("tokens_holders").for(source).update({ "amount": newAmount }).where("holder", to);
              } else {
                await this.relationalQuery("tokens_holders").for(source).insert({ holder: to, amount: new BigNumber(value).toString() })
              }

            }
          } catch (error) { /* Not Event Mint Block */ }

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
  
                // Transfer event
                try {
                  let _transferEvent = Token.transferEvent(data);
                  if(_transferEvent) {
                    let transfer = {
                      operation: name,
                      from: bs58.encode(_transferEvent.from),
                      to: bs58.encode(_transferEvent.to),
                      value: _transferEvent.value,
                      token_id: source,
                      transaction_id: transaction_id,
                      block_num: block_num,
                    }
                    let queryRelationTokensTx = this.relationalQuery("tokens_transactions");
                    await queryRelationTokensTx.for(source).insert(transfer);

                    // update and insert if not extist - transfer to
                    let queryRelationTokensHolderTo = await this.relationalQuery("tokens_holders").for(source).findOne('holder', transfer.to)
                    if(queryRelationTokensHolderTo) {
                      let newAmount = new BigNumber(queryRelationTokensHolderTo.amount).plus(_transferEvent.value).toString();
                      await this.relationalQuery("tokens_holders").for(source).update({ "amount": newAmount }).where("holder", transfer.to);
                    } else {
                      await this.relationalQuery("tokens_holders").for(source).insert({ holder: transfer.to, amount: new BigNumber(_transferEvent.value).toString() })
                    }

                    // update and insert if not extist - transfer from
                    let queryRelationTokensHolderFom = await this.relationalQuery("tokens_holders").for(source).findOne({ 'holder': transfer.from });
                    if(queryRelationTokensHolderFom) {
                      let newAmount = new BigNumber(queryRelationTokensHolderFom.amount).minus(_transferEvent.value).toString();
                      await this.relationalQuery("tokens_holders").for(source).update({ "amount": newAmount }).where("holder", transfer.from);
                    } else {
                      await this.relationalQuery("tokens_holders").for(source).insert({ holder: transfer.from, amount: new BigNumber(_transferEvent.value).toString() })
                    }

                  }
                } catch (error) { /* not is transfer event*/ }

                // Mint event
                try {
                  let _mintEvent = Token.mintEvent(data);
                  if(_mintEvent) {
                    let to = bs58.encode(_mintEvent.to);
                    let value = _mintEvent.value;
                    let queryRelationTokensSystem = await this.relationalQuery("tokens_holders").for(source).findOne({ 'holder': to });
                    if(queryRelationTokensSystem) {
                      let newAmount = new BigNumber(queryRelationTokensSystem.amount).plus(value).toString();
                      await this.relationalQuery("tokens_holders").for(source).update({ "amount": newAmount }).where("holder", to);
                    } else {
                      await this.relationalQuery("tokens_holders").for(source).insert({ holder: to, amount: new BigNumber(value).toString() })
                    }
      
                  }
                } catch (error) { /* Not Event Mint Block */ }
  
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