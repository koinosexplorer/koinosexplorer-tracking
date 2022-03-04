exports.up = function(knex) {
  return knex.schema.createTable('transactions_operations',function(table){
    /**
     * Data
     */
    table.string('operation_type').nullable();
    table.string('contract_id').nullable();
    table.integer('order').nullable();
    table.text('operation').nullable();
    
    /**
     * Relations
     */
    table.string('transaction_id').references('transaction_id').inTable('transactions').notNullable();

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')

    table.unique(['transaction_id', 'order']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions_operations')
};