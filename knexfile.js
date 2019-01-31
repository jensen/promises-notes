require('dotenv').load();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_DATABASE 
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
