function id(ids) {
  return ids[Math.floor(Math.random() * ids.length)];
}

exports.seed = function(knex, Promise) {
  return Promise.all([
    knex('urls').del(),
    knex('users').del()
  ])
  .then(() => {
    return knex('users').insert([
      { email: 'first@user.com', password: '123456' },
      { email: 'second@user.com', password: '123456' },
      { email: 'third@user.com', password: '123456' }
    ]).returning('id');
  })
  .then((ids) => {
    return knex('urls').insert([
      { short: 'abc', long: 'https://www.lighthouselabs.ca/', user_id: id(ids)},
      { short: 'xyz', long: 'https://www.google.ca/', user_id: id(ids)},
    ]);
  });
};
