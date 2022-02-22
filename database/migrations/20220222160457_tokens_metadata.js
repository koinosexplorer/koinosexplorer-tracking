exports.up = function(knex) {
  return knex.schema.createTable('tokens_metadata',function(table){
    /**
     * Data
     */
    table.string('id').primary().comment('random id for backend')
    table.string('name').notNullable();
    table.text('value').nullable();
     
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
  return knex.schema.dropTableIfExists('tokens_metadata')
};