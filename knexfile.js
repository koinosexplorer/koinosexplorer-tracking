// add env
require('dotenv').config();

// ref: https://devhints.io/knex
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${ __dirname }/database/migrations`
    },
    seeds: {
      directory: `${ __dirname }/database/seeds`
    }
  },
  production: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${ __dirname }/database/migrations`
    },
    seeds: {
      directory: `${ __dirname }/database/seeds`
    }
  }
}