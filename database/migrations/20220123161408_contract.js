exports.up = function(knex) {
  return knex.schema.createTable('contracts',function(table){
    /**
     * Data
     */
    table.string('contract_id').primary()
    table.string('address_upload').nullable();
    table.string('transactions_upload').nullable();


    /**
    * Default data
    */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('contracts')
};