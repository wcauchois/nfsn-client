
module.exports = function(apiCall) {
  var listRRs = function(domain, opts, cb) {
    if (typeof cb == 'undefined') cb = opts;
    apiCall('/dns/' + domain + '/listRRs', 'POST', opts, cb);
  };
  listRRs.argNames = ['name', 'type', 'data'];

  return {
    listRRs: listRRs
  };
};

