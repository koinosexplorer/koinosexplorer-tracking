exports.up = function(knex) {
  return knex.schema.createTable('blocks_receipts',function(table){
    /**
     * Data
     */
    table.string('id').primary().comment('random id for backend')
    table.string('name').notNullable();
    table.text('value').nullable();
    
    /**
     * Relations
     */
     table.integer('block_num').references('block_num').inTable('blocks').notNullable().onUpdate('CASCADE').onDelete('CASCADE');


    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
    /**
     * Configs data
     */
    table.unique(['block_num','name']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('blocks_receipts')
};