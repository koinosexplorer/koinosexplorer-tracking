exports.up = function(knex) {
  return knex.schema.createTable('tokens',function(table){
    /**
     * Data
     */
    table.string('token_id').primary().comment('contract id in blockchain')
    table.string('name').nullable();
    table.string('symbol').nullable();
    table.string('decimals').nullable();
    
    /**
     * Relations
     */
    table.integer('block_num').references('block_num').inTable('blocks').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    table.string('transaction_id').references('transaction_id').inTable('transactions').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    table.string('contract_id').references('contract_id').inTable('contracts').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tokens')
};