exports.up = function(knex) {
  return knex.schema.createTable('tokens_holders',function(table){
    /**
     * Data
     */
    table.string('holder').notNullable();
    table.bigInteger('amount').notNullable();
    
    /**
     * Relations
     */
    table.string('token_id').references('token_id').inTable('tokens').notNullable();
    

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tokens_holders')
};