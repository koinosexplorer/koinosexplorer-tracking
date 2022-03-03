const { KnexPool } = require('./../helpers/knex');
const { Controller } = require('./controller');
const { Model: ContractsModel } = require('./../models/ContractsModel');

// 
const _ = require('lodash')

class ContractsController extends Controller {
  constructor() {
    super({ model: ContractsModel, knex: KnexPool, prefix: 'contracts' })
  }
  async processBlock(block) {
    const transactions = _.get(block, 'block.transactions', []);
    if(transactions.length) {
      for (let index = 0; index < transactions.length; index++) {
      }
    }

  }
}

module.exports = ContractsController