const request = require('./lib/request');
const uppercase = require('./lib/uppercase');

/* First retrieve a random name from an api */
request('https://randomuser.me/api/')
.then((body) => {
  /* Then take the body data and parse it into JS */
  const data = JSON.parse(body);

  /* Make sure that we got a response with results */
  if(data.results.length === 0) {
    throw new Error('Need a name to search for, API returned empty list.');
  }

  /* Extract first and last name */
  const user = data.results[0];
  const { first, last } = user.name;

  /* Provide feedback to the user */
  console.log(`Searching for ${uppercase(first)} ${uppercase(last)}`);

  /* Start second request to search for first and last name on wikipedia */
  return request(`https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${first}%20${last}`);
})
.then((body) => {
  /* Then take the body data and parse it into JS */
  const data = JSON.parse(body);

  /* Make sure that we got results back */
  if(data.query.search.length === 0) {
    throw new Error('No results for that name.');
  }

  /* Print the titles of each article found during the search */
  data.query.search.forEach((result) => {
    console.log(result.title);
  });
})
.catch((error) => {
  /* Print the error if it is caught */
  console.log(error);
});
