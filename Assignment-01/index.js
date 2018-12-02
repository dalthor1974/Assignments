/*
 * The API for home assignment 01
 *
 * Tested: OK!
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var config = require('./config');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log('The HTTP server is started and listening on port ' + config.httpPort + '...');
});

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log('The HTTPS server is started and listening on port ' + config.httpsPort + '...');
});

// The unified server logic for both the http and the https server
var unifiedServer = function(req, res) {
  // Get the URL and parse it
  var parsedURL = url.parse(req.url, true);

  // Get the path
  var path = parsedURL.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedURL.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });
  req.on('end', function() {
    buffer += decoder.end();

    // Choose the appropriate handler. If one is not found, choose the notFound handler
    var chosenHandler =
      typeof(router[trimmedPath]) !== 'undefined'
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    // Route the request to the handler
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode =
        typeof(statusCode) == 'number'
          ? statusCode
          : 200;

      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object'
        ? payload
        : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Send the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the response
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
};

// Define the handlers
var handlers = {};

// Ping handler
handlers.hello = function(data, callback) {
  callback(200, {'greeting': 'Hello and welcome to my RESTful JSON API!'});
};

// Not-found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a router
var router = {
  'hello': handlers.hello
};
