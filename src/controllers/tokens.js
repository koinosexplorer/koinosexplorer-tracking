const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: TokensModel } = require('./../models/TokensModel');
const { logger } = require('./../utils');
const { recoverTx } = require('./../helpers/signer')

// helpers
const _ = require('lodash');

class TokensController extends Controller {
  constructor() {
    super({ model: TokensModel, knex: KnexPool, prefix: 'tokens' })
  }
  async process_block(block) {
    const transactions = _.get(block, 'block.transactions', []);
    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
      }
    }

  }
}

module.exports = TokensController;