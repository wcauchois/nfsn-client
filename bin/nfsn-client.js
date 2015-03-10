#!/usr/bin/env node

var parseArgs = require('minimist'),
    NfsnClient = require('../'),
    tty = require('tty'),
    _ = require('lodash');

function usage() {
  console.log('usage: nfsn-client ' +
    '--login LOGIN --api-key API_KEY [--use-ntp|-n] [--ntp-host HOST] [--ntp-port PORT] ' +
    '[...] site instance method');
}

if (require.main === module) {
  var argv = parseArgs(process.argv.slice(2), {
    'boolean': ['use-ntp', 'n', 'help']
  });

  if (argv['help']) {
    usage();
    process.exit(0);
  }

  var login = argv['login'] || process.env['NFSN_LOGIN'];
  var apiKey = argv['api-key'] || process.env['NFSN_API_KEY'];

  if (!login || !apiKey) {
    console.log('Error: A login and API key is required.\n');
    usage();
    process.exit(1);
  }

  var clientOpts = {login: login, apiKey: apiKey};

  var useNtp = argv['use-ntp'] || argv['n'];
  if (useNtp) {
    clientOpts.ntpHost = argv['ntp-host'] || 'time1.google.com';
    clientOpts.ntpPort = argv['ntp-port']; // If undefined, uses default.
  }

  var site = argv._[0];
  var instance = argv._[1];
  var method = argv._[2];
  if (!(site && instance && method)) {
    console.log('Error: At least 3 arguments required\n');
    usage();
    process.exit(1);
  }

  var client = new NfsnClient(clientOpts);
  if (!client[site]) {
    console.log('Error: Unknown method group: ' + site);
    process.exit(1);
  }
  if (!client[site][method]) {
    console.log('Error: Unknown method: ' + method);
    process.exit(1);
  }

  var func = client[site][method];
  var args = {};
  _.each(func.argNames, function(argName) {
    if (_.isObject(argName)) {
      // An argname can be of the form {"cli-argument", "actual-api-argument"}
      var key = _.first(_.keys(argName));
      if (argv[key]) {
        args[argName[key]] = argv[key];
      }
    } else if (argv[argName]) {
      args[argName] = argv[argName];
    }
  });

  func.call(client, instance, args, function(err, resp) {
    if (err) {
      console.log('Error: ' + (err.message || err));
      process.exit(1);
    } else {
      var output;
      if (tty.isatty(process.stdout.fd)) {
        // Pretty-print for terminal output.
        output = JSON.stringify(resp, undefined, 2);
      } else {
        output = JSON.stringify(resp);
      }
      console.log(output);
      process.exit(0);
    }
  });
}

