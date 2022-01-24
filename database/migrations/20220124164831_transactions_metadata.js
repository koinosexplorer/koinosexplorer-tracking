exports.up = function(knex) {
  return knex.schema.createTable('transactions_metadata',function(table){
    /**
     * Data
     */
    table.string('id').primary().comment('random id for backend')
    table.string('name').notNullable();
    table.text('value').nullable();
    
    /**
     * Relations
     */
     table.string('transaction_id').references('transaction_id').inTable('transactions').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions_metadata')
};