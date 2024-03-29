exports.up = function(knex) {
  return knex.schema.createTable('tokens_transactions',function(table){
    /**
     * Data
     */
    table.string('operation').notNullable();
    table.string('from').notNullable();
    table.string('to').notNullable();
    table.bigInteger('value').notNullable();

    
    /**
     * Relations
     */
    table.string('token_id').references('token_id').inTable('tokens').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    table.string('transaction_id').references('transaction_id').inTable('transactions').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    table.integer('block_num').references('block_num').inTable('blocks').notNullable().onUpdate('CASCADE').onDelete('CASCADE');

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tokens_transactions')
};