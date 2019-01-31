exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('email');
    table.string('password');
  }).then(() => {
    return knex.schema.createTable('urls', (table) => {
      table.increments();
      table.string('short');
      table.string('long');
      table.integer('user_id').unsigned();
      table.foreign('user_id').references('users.id').onDelete('CASCADE');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('urls').then(() => {
    return knex.schema.dropTable('users')
  })
};
