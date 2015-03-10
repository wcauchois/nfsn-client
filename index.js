var request = require('request'),
    crypto = require('crypto'),
    url = require('url'),
    util = require('util'),
    ntpClient = require('ntp-client'),
    querystring = require('querystring'),
    async = require('async'),
    _ = require('lodash');

var dnsMethods = require('./lib/dns');

function NfsnClient() {
  this.initialize.apply(this, arguments);
}

_.extend(NfsnClient.prototype, {
  initialize: function(opts) {
    this.login = opts.login;
    this.apiKey = opts.apiKey;

    this.ntpHost = opts.ntpHost;
    if (this.ntpHost) {
      this.ntpPort = opts.ntpPort || 123;
      this.ntpRetries = opts.ntpRetries || 3;
    }

    this.dns = dnsMethods(this.apiCall.bind(this));
  },

  apiCall: function(path, method, args, cb) {
    if (this.ntpHost) {
      async.retry(this.ntpRetries, function(timestampCb) {
        ntpClient.getNetworkTime(this.ntpHost, this.ntpPort, function(err, date) {
          if (err) {
            timestampCb(err);
          } else {
            timestampCb(null, Math.floor(date.getTime() / 1000));
          }
        });
      }.bind(this), function(err, timestamp) {
        if (err) {
          cb(err);
        } else {
          this.apiCallWithDate(path, method, args, timestamp, cb);
        }
      }.bind(this));
    } else {
      var timestamp = Math.floor(new Date().getTime() / 1000);
      this.apiCallWithDate(path, method, args, timestamp, cb);
    }
  },

  apiCallWithDate: function(path, method, args, timestamp, cb) {
    // Matters for when we take the hash of the path.
    path = (path.charAt(0) === '/') ? path : ('/' + path);
    method = method.toUpperCase();

    var formattedUrl = url.format({
      protocol: 'https',
      host: NfsnClient.API_HOST,
      pathname: path
    });

    // auth is login;timestamp;salt;hash
    // hash is SHA1 of login;timestamp;salt;api-key;request-uri;body-hash
    // body-hash is SHA1 of request body (or empty string)
    var argsEmpty = _.isEmpty(args);
    var salt = crypto.randomBytes(8).toString('hex');
    var body = (method !== 'GET' && !argsEmpty) ? querystring.stringify(args) : '';
    var bodyHash = crypto.createHash('sha1').update(body).digest('hex');

    var hash = crypto.createHash('sha1').update([
      this.login,
      timestamp,
      salt,
      this.apiKey,
      path,
      bodyHash
    ].join(';')).digest('hex');

    var auth = [
      this.login,
      timestamp,
      salt,
      hash
    ].join(';');

    request({
      method: method,
      uri: formattedUrl,
      qs: (method === 'GET' && !argsEmpty) ? args : undefined,
      body: body || undefined,
      headers: _.extend({
        'X-NFSN-Authentication': auth
      }, (method === 'POST') ? {'Content-Type': 'application/x-www-form-urlencoded'} : {})
    }, function(error, response, body) {
      if (error) {
        cb(error);
      } else {
        var jsonBody;
        if (!body) {
          // Empty response case
          jsonBody = {};
        } else {
          try {
            jsonBody = JSON.parse(body);
          } catch (ex) {
            cb(ex);
          }
        }

        if (jsonBody) {
          if (response.statusCode !== 200) {
            var ex = new Error(util.format('%s (%s)', jsonBody.error, jsonBody.debug));
            ex.statusCode = response.statusCode;
            cb(ex);
          } else {
            cb(undefined, jsonBody);
          }
        }
      }
    });
  }
});

NfsnClient.API_HOST = 'api.nearlyfreespeech.net';

module.exports = NfsnClient;

