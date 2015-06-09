NearlyFreeSpeech.NET API Client
===

This package implements a Node.js client for the [NearlyFreeSpeech.NET](https://www.nearlyfreespeech.net/)
[API](https://members.nearlyfreespeech.net/wiki/API/Introduction). Additionally, a command-line program
that uses the library is provided.

NFSN is a (bretty gud) web host/registrar. Their API allows you to update DNS records and access
information about your account, among other things. Note that in order to obtain an API key, you
must currently submit a support request. See the
[API introduction](https://members.nearlyfreespeech.net/wiki/API/Introduction) (requires login) for more information.

Install
---

    npm install nfsn-client

Use `-g` if you want the CLI to be available globally.

Example
---

```js
var NfsnClient = require('nfsn-client');
// You'll need your own values for login/apiKey
var client = new NfsnClient({
  login: 'joe_user',
  apiKey: 'super_secret'
});
client.dns.listRRs('example.com', {type: 'A'}, function(err, resp) {
  if (!err) {
    console.log(JSON.stringify(resp, undefined, 2));
  }
});
```

Details
---

In order to access the API, you must construct an instance of `NfsnClient` (this is the
root export of this module). `NfsnClient` takes a single argument, a dictionary of options,
of which the following are supported:

- **login** (required): Your username on NearlyFreeSpeech.NET.
- **apiKey** (required): Your API key.
- **ntpHost**: The hostname of an NTP server to use for acquiring a timestamp.
- **ntpPort**: The port for the NTP server (default: 123).
- **ntpRetries**: The # of times to retry fetching a date from the NTP server (default: 3).

NTP support is provided because the NFSN API is very time sensitive (you must embed a
timestamp in every request). If your system clock deviates by more than 5 seconds from
the API servers', you request will be rendered invalid. NTP is optional, and if your
system time is configured correctly you can omit these parameters.

Methods
---

### `client.apiCall(path, method, args, cb)`

This is the most flexible entry point to the NFSN client. Specify any resource,
the method to use (GET, PUT, or POST), and a dictionary of arguments to make an
authenticated API call. The `cb` should accept the arguments `(err, jsonResponse)`.

See the [NFSN reference](https://members.nearlyfreespeech.net/wiki/API/Reference) for
information about the methods and accessors available, as well as their arguments.

### `client.dns.listRRs(domain, [opts], cb)`

List the DNS resource records associated with the specified domain.

### `client.dns.addRR(domain, opts, cb)`

Add a resource record to a domain's DNS.

### `client.dns.removeRR(domain, opts, cb)`

Remove a resource record from a domain's DNS.

### More Methods

You should be able to call any API method using `apiCall`, but if you'd like
to add concrete methods for API functions I'm happy to accept pull requests.

CLI
---

This package also provides an `nfsn-client` command-line tool.

    usage: nfsn-client --login LOGIN --api-key API_KEY [--use-ntp|-n] [--ntp-host HOST] [--ntp-port PORT] [...] site instance method

A `LOGIN` and `API_KEY` are required. These can also be specified via the
`NFSN_LOGIN` and `NFSN_API_KEY` environment variables.

- **site** should be the general category of method you want to invoke (currently only `dns`
  is supported).
- **instance** should be the identifier of the entity you want to operate on (e.g. a domain name).
- **method** should be the individual API method you want to invoke (e.g. `listRRs`).

Note that _site_ and _method_ correspond to a first-level object on `client` (e.g. `client.dns`)
and a second-level method (e.g. `client.dns.listRRs)` respectively.

You may also pass additional arguments specific to the method (e.g. `--type` for `listRRs` to
restrict results to that record type). These arguments should correspond to the arguments
detailed in the NFSN reference.

Some methods, like `addRR`, require parameters. You'll get an error if you omit these.

The output is pretty-printed JSON, unless it detects you're piping to another command.

### Example Command-Line Usage

## Listing resource records for a domain

Use `type` to restrict to a specific type of record.

    nfsn-client --login joe_user --api-key super_secret dns example.com listRRs --type A

## Remove a resource record for a subdomain

    nfsn-client --login joe_user --api-key super_secret dns example.com removeRR --name subdomain --type A

---

    export NFSN_LOGIN=joe_user
    export NFSN_API_KEY=super_secret
    nfsn-client dns example.com listRRs

