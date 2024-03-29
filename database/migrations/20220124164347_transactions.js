exports.up = function(knex) {
  return knex.schema.createTable('transactions',function(table){
    /**
     * Data
     */
    table.string('transaction_id').primary();
    table.string('caller').nullable();
    
    /**
     * Relations
     */
    table.integer('block_num').references('block_num').inTable('blocks').notNullable().onUpdate('CASCADE').onDelete('CASCADE');
    

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions')
};