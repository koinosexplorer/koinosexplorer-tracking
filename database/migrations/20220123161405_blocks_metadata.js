exports.up = function(knex) {
  return knex.schema.createTable('blocks_metadata',function(table){
    /**
     * Data
     */
    table.string('id').primary().comment('random id for backend')
    table.string('name').notNullable();
    table.text('value').nullable();
    
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
  return knex.schema.dropTableIfExists('blocks_metadata')
};