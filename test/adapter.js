var p0 = require('../index.js');

module.exports = {
    deferred: function() {
        var promise = new p0();

        return {
            promise: promise,
            resolve: function(value) {
                promise.fulfill(value);
            },
            reject: function(reason) {
                promise.reject(reason);
            }
        }
    }
};
