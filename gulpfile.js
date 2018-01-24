require('babel-core/register');
require('babel-polyfill');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('./tasks/build');
require('./tasks/lint');
require('./tasks/publish');
require('./tasks/spec');
require('./tasks/default');