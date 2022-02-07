const knex = require('knex');
const knex_configs = require('./../../knexfile');

const KnexPool = knex(knex_configs[process.env.ENV || 'development'])

module.exports = {
  KnexPool: KnexPool
};