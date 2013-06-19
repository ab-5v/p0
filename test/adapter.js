var pzero = require('../index.js');

module.exports = {
    fulfilled: function(value) {
        var promise = new pzero();
        promise.fulfill(value);
        return promise;
    },
    rejected: function(reason) {
        var promise = new pzero();
        promise.reject(reason);
        return promise;
    },
    pending: function() {
        var promise = new pzero();

        return {
            promise: promise,
            fulfill: function(value) {
                promise.fulfill(value);
            },
            reject: function(reason) {
                promise.reject(reason);
            }
        }
    }
};
