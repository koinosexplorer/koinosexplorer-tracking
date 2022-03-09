const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');
const { logger } = require('./../utils');
const { txSerializer, provider, signer, getTokenInformation } = require('./../helpers/koilib');
const { utils: UtilsKoilib, Contract } = require('koilib');

// helpers
const _ = require('lodash');

class TokensController extends Controller {
  constructor() {
    super({ model: TokensModel, knex: KnexPool, prefix: 'tokens' })
  }
  async processBlock(data) {
    const block = _.get(data, 'block', {});
    const block_num = _.get(block, 'header.height', '0');
    const transactions = _.get(block, 'transactions', []);

    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
        try {
          let transaction = transactions[index];
          let transaction_id = _.get(transaction, 'id', '');

          // check operations
          if(transaction.operations) {
            let operations = transaction.operations;
            for (let index = 0; index < operations.length; index++) {
              let operation = operations[index];
              let operationtype = _.head(Object.keys(operation));
              let contractId = _.get(operation, `${operationtype}.contract_id`, '');

              if(operationtype == 'upload_contract') {
                // OPERATION UPLOAD CONTRACT
                try {

                  let tokenInfo = await getTokenInformation(contractId);
                  let name = undefined, symbol = undefined, decimals = undefined;
                  if(tokenInfo) {
                    name = tokenInfo.name;
                    symbol = tokenInfo.symbol;
                    decimals = tokenInfo.decimals;
                  }
                  if(name && symbol && decimals) {
                    let tokenFinal = {
                      token_id: contractId,
                      name: typeof name == 'string' ? name : name.toString(),
                      symbol: typeof symbol == 'string' ? symbol : symbol.toString(),
                      decimals: typeof decimals == 'string' ? decimals : decimals.toString(),
                      // relations
                      block_num: block_num,
                      transaction_id: transaction_id,
                      contract_id: contractId
                    }
                    let querySelect = this.singleQuery();
                    querySelect.where('contract_id', tokenFinal.token_id);
                    querySelect.then(async (contractExist) => {
                      let query = this.singleQuery();          
                      if(contractExist.length == 0) {
                        await query.insert(tokenFinal);
                      } else {
                        await query.update(tokenFinal).where('contract_id', tokenFinal.token_id);
                      }
                      return;
                    })
                  }

                } catch (error) { /* CONTRACT NOT KRC20 */ }

              }
              if(operationtype == 'call_contract' ) {

                // OPERATION UPLOAD CONTRACT                
                try {
                  const Krc20Contract = new Contract({ id: contractId, abi: UtilsKoilib.Krc20Abi })
                  const decodedKRC20Operation = await Krc20Contract.decodeOperation(operation)
                  let tokenTransfer = {
                    operation: decodedKRC20Operation.name,
                    from: decodedKRC20Operation.args.from,
                    to: decodedKRC20Operation.args.to,
                    value: decodedKRC20Operation.args.value,
                    // relations
                    transaction_id: transaction_id,
                    token_id: contractId
                  }
                  // save transfer
                  let queryRelationMetaData = this.relationalQuery("tokens_transactions");
                  await queryRelationMetaData.for(contractId).insert(tokenTransfer);
                } catch (error) { /* CONTRACT NOT IS A TOKEN */ }

              }

            }
          }
          

        } catch (error) {
          logger('controller tokens', 'Blue')
          logger(error.message, 'Red');
          console.log(data);
          process.exit();
        }
      }
    }

  }

  // utils
  getTokenContract(contractID) {
    let Krc20Contract = new Contract({
      id: contractID,
      abi: utils.Krc20Abi,
      provider,
      signer
    })
    return Krc20Contract;
  }
}

module.exports = TokensController;