exports.up = function(knex) {
  return knex.schema.createTable('contracts_metadata',function(table){
    /**
     * Data
     */
    table.string('id').primary().comment('random id for backend')
    table.string('name').notNullable();
    table.text('value').nullable();
    
    /**
     * Relations
     */
     table.string('contract_id').references('contract_id').inTable('contracts').notNullable().onUpdate('CASCADE').onDelete('CASCADE');


    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
    /**
     * Configs data
     */
    table.unique(['contract_id','name']);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('contracts_metadata')
};