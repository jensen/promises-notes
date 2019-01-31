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