
module.exports = function(apiCall) {
  // https://members.nearlyfreespeech.net/wiki/API/DNSListRRs
  var listRRs = function(domain, opts, cb) {
    if (typeof cb === 'undefined') cb = opts;
    apiCall('/dns/' + domain + '/listRRs', 'POST', opts, cb);
  };
  listRRs.argNames = ['name', 'type', 'data'];

  // https://members.nearlyfreespeech.net/wiki/API/DNSAddRR
  var addRR = function(domain, opts, cb) {
    apiCall('/dns/' + domain + '/addRR', 'POST', opts, cb);
  };
  addRR.argNames = ['name', 'type', 'data', 'ttl'];

  // https://members.nearlyfreespeech.net/wiki/API/DNSRemoveRR
  var removeRR = function(domain, opts, cb) {
    apiCall('/dns/' + domain + '/removeRR', 'POST', opts, cb);
  };
  removeRR.argNames = ['name', 'type', 'data'];

  return {
    listRRs: listRRs,
    addRR: addRR,
    removeRR: removeRR
  };
};

