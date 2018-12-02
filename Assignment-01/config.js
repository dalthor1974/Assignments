/*
 * The configuration file for home assignment 01
 *
 * Tested: Not yet
*/

var environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
};

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
};

// Determine which environment was passed (if any)
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the passed environment exists, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
