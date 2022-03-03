const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');

// koilib config
const { Contract, utils } = require('koilib');
const { provider, signer } = require('./../helpers/koilib');

// helpers
const _ = require('lodash');

class TokensController extends Controller {
  constructor() {
    super({ model: TokensModel, knex: KnexPool, prefix: 'tokens' })
  }
  async processBlock(block) {
    const transactions = _.get(block, 'block.transactions', []);
    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
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