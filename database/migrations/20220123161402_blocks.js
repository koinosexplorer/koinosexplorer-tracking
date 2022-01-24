exports.up = function(knex) {
  return knex.schema.createTable('blocks',function(table){
    /**
     * Data
     */
    table.string('block_num').primary()
    table.string('producer').nullable()

    /**
     * Default data
     */
    table.timestamp('created_at')
    table.timestamp('updated_at')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('blocks')
};