# Errors and Promises

Slides and notes available at [https://github.com/jensen/promise-notes/](https://github.com/jensen/promise-notes/).

## Synchronous Code

### Handling Errors

#### Crashes

If we do not handle errors then our program will crash. You have seen this with ReferenceError and TypeError.

```javascript
function breaker(a, b) {
  if(b === 0) {
    throw('Cannot divide by zero.');
  }

  return a/b;
}

console.log(breaker(10, 2)); // should return 5
console.log(breaker(10, 0)); // should throw error
console.log('All done.'); // should never run because of the crash
```

#### try/catch

If we catch the error, then our program will no longer crash.

```javascript
function breaker(a, b) {
  if(b === 0) {
    throw('Cannot divide by zero.');
  }

  return a/b;
}

try {
  console.log(breaker(10, 2)); // should return 5
  console.log(breaker(10, 0)); // should throw error
} catch(e) {
  /* Instead of crashing the error will be caught */
  console.log(e);
} finally {
  console.log('All done.');
}
```

We can use `finally` to run code no matter what.

## Asynchronous Code

We have a problem when we start calling async functions instead. 

```javascript
function breaker(a, b, callback) {
  setTimeout(() => {
    if(b === 0) {
      throw('Cannot divide by zero.');
    }

    callback(a/b);
  })
}

try {
  breaker(10, 2, (result) => {
    console.log(result);
  });

  breaker(10, 0, (result) => {
    console.log(result);
  });
} catch(e) {
  console.log(e);
} finally {
  console.log('All done.');
}
```

We can't use the same error handling in the same way with async code. The output will be:

```
All done.
5
Error: "Cannot divide by zero."
```

### Callbacks

__Error first callbacks (Node Style):__

```javascript
function onComplete(error, result) {
  if(error) {
    console.log('Failure');
    return;
  }

  console.log('Successful');
}

request('https://example.com', onComplete);
```

__Sucess/Failure callbacks (jQuery Style):__

```javascript
function onSuccess() {
  console.log('Successful');
}

function onFailure() {
  console.log('Failure');
}

request('https://example.com', success, failure);
```

### Promises

We have a solution for both async code and separating out the success and failure handling. Promises solve a few problems for us. Promises allow us to return values that do not exist yet, but will exist in the future. 

> Promises are an easily repeatable mechanism for encapsulating and composing future values.

#### Callback Hell

Callbacks are a source of confusion for new JavaScript developers. When we have to sequences a few calls together we can get into a certain [callback hell](http://callbackhell.com/). As we require more steps in our operation, we scale the code out horizontally in the editor. This makes it hard to understand the flow of the code.

```javascript
function makeStep(name, duration) {
  return (cb) => {
    setTimeout(() => {
      if(Math.floor(Math.random() * 2)) {
        cb(new Error('Something went wrong'));
        return;
      }
      cb(null, name);
    }, duration);
  }
}

const first = makeStep('first', 1000);
const second = makeStep('second', 2000);
const third = makeStep('third', 3000);
const fourth = makeStep('fourth', 4000);

first((error, result) => {
  if(error) {
    console.log(error.message);
  } else {
    console.log(result);
  }

  second((error, result) => {
    if(error) {
      console.log(error.message);
    } else {
      console.log(result);
    }

    third((error, result) => {
      if(error) {
        console.log(error.message);
      } else {
        console.log(result);
      }

      fourth((error, result) => {
        if(error) {
          console.log(error.message);
        } else {
          console.log(result);
        }
      });
    });
  });
});
```

#### Inversion of Control

Callback hell is a nice thing to avoid. One of the important considerations when using a library that requires you to pass a callback is the trust. We trust that the library receiving the callback will behave. What if they call the callback more than once, or not at all. We trust the libraries to do the right thing with the callback we provide.

Promises solve this problem by following rules. One of the rules is that a promise can only be resolved once.

#### API

A Promise has three states:

- pending: initial state, neither fulfilled nor rejected
- fulfilled: the operation completed successfully
- rejected: the operation failed

We can create a new Promise using the Promise constructor. Imagine if we wanted to use promises with the request library, which uses the error first callback. We could wrap it up and return a Promise instead. 

```javascript
const request = require('request');

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      if(error) {
        reject(error);
        return;
      }

      resolve(body);
    });
  });
}
```

In this case the `resolve` and `reject` functions are passed into the `executor`. We can use these to change the state of the promise.

```javascript
Promise.resolve()
Promise.reject()

Promise.prototype.then()
Promise.prototype.catch()

Promise.all()
```

Using this API we can make our code easier to reason about.

- First delete the records from two tables. Wait for both to complete.
- Then insert the first set of records into the db, returning an array of ids.
- Then use the ids to create the second set of records.

```javascript
Promise.all([
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
```

When we return a promise from one `then` call, we can handle it using a following `then`.

There are some other methods available that you may not need initially: 

```javascript
Promise.race()
Promise.prototype.finally()
```

We can pass Promise.race() an array of promises. It will resolve or reject, based on the first promise to either resolve or reject. Here is an example of a timeout wtih a request. If the request finished first, then we will resolve that. If the timeout occurs first then it will reject.

```javascript
function createTimeout(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout');
    }, time);
  });
}

/* Fake request, but it will either take 1500 or 6000 ms to complete */
function request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('<html>The body of example.com</html>');
    }, Math.floor(Math.random() * 2) ? 1500 : 6000)
  });
}

Promise.race([createTimeout(3000), request('http://example.com')])
  .then((result) => console.log(result))
  .catch((error) => console.log(error));
```

### References

- [MDN Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- Kyle Simpson [Async & Performance](https://github.com/getify/You-Dont-Know-JS/tree/master/async%20%26%20performance)
