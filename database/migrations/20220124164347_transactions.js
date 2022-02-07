exports.up = function(knex) {
  return knex.schema.createTable('transactions',function(table){
    /**
     * Data
     */
    table.string('transaction_id').primary();
    table.string('operation').nullable();
    table.string('caller').nullable();
    table.string('contract_id').nullable();
    
    /**
     * Relations
     */
    table.string('block_num').notNullable();
    

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