NearlyFreeSpeech.NET API Client
===

This package implements a Node.js client for the [NearlyFreeSpeech.NET](https://www.nearlyfreespeech.net/)
[API](https://members.nearlyfreespeech.net/wiki/API/Introduction). Additionally, a command-line program
that uses the client is provided.

NSFN is a (bretty gud) web host/registrar. Their API allows you to update DNS records and access
information about your account, among other things. Note that in order to obtain an API key, you
must currently submit a support request. See the
[API introduction](https://members.nearlyfreespeech.net/wiki/API/Introduction) for more information.

Example
---

```js
var NsfnClient = require('nsfn-client');
// You'll need your own values for login/apiKey
var client = new NsfnClient({
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

In order to access the API, you must construct an instance of `NsfnClient` (this is the
sole export of this module). `NsfnClient` takes a single argument, a dictionary of options,
of which the following are supported:

- *login* (required): Your username on NearlyFreeSpeech.NET.
- *apiKey* (required): Your API key.
- *ntpHost*: The hostname of an NTP server to use for acquiring a timestamp.
- *ntpPort*: The port for the NTP server (default: 123).
- *ntpRetries*: The # of times to retry fetching a date from the NTP server (default: 3).

NTP support is provided because the NSFN API is very time sensitive (you must embed a
timestamp in every request). If your system clock deviates by more than 5 seconds from
the API servers', you request will be rendered invalid. NTP is optional, and if your
system time is configured correctly you can omit these parameters.

Methods
---

### `apiCall(path, method, args, cb)`

This is the most flexible entry point to the NFSN client. Specify any resource,
the method to use (GET, PUT, or POST), and a dictionary of arguments to make an
authenticated API call. The `cb` should accept the arguments `(err, jsonResponse)`.

