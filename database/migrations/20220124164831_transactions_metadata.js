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
     table.string('transaction_id').references('transaction_id').inTable('transactions').notNullable().onUpdate('CASCADE').onDelete('CASCADE');

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
    /**
     * Configs data
     */
    table.unique(['transaction_id','name']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions_metadata')
};