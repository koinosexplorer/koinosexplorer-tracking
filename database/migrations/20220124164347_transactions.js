exports.up = function(knex) {
  return knex.schema.createTable('transactions',function(table){
    /**
     * Data
     */
    table.string('transaction_id').primary();
    table.integer('operations').nullable().defaultTo(0);
    table.string('caller').nullable();
    
    /**
     * Relations
     */
    table.string('block_num').references('block_num').inTable('blocks').notNullable();
    

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