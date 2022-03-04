const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');
const { logger } = require('./../utils');
const { txSerializer, provider, signer } = require('./../helpers/koilib');
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

          // decerializer active transaction
          transaction.active = await txSerializer.deserialize(transaction.active);

          // check operations
          if(transaction.active.operations) {
            let operations = transaction.active.operations;
            for (let index = 0; index < operations.length; index++) {
              let operation = operations[index];
              let operation_type = _.head(Object.keys(operation));
              let contractId = ''
              let operationsHaveContractId = ["upload_contract", "call_contract"]
              if(_.get(operation, `${operation_type}.contract_id`, false) && operationsHaveContractId.indexOf(operation_type) != -1 ) {
                contractId = UtilsKoilib.encodeBase58(operation[operation_type].contract_id);
              }
              // check operations tokens
              if(operation_type == 'upload_contract' && contractId) {
                try {
                  const Krc20Contract = new Contract({ id: contractId, abi: UtilsKoilib.Krc20Abi, provider, signer })
                  const { result: { value: name } } = await Krc20Contract.functions.name()
                  const { result: { value: symbol } } = await Krc20Contract.functions.symbol()
                  const { result: { value: decimals } } = await Krc20Contract.functions.decimals()
                  const { result: { value: totalSupply } } = await Krc20Contract.functions.totalSupply()
                  const { result: { value: balance } } = await Krc20Contract.functions.balanceOf(contractId)
                  if(name && symbol && decimals && totalSupply && balance) {
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
                    })
                  }
                } catch (error) {
                  // not Krc20 compliant or already exists
                }
              }
              if(operation_type == 'call_contract' && contractId) {
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
                } catch (error) {
                  // not Krc20Contract
                }
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