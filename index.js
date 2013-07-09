;(function(root, undef) {

var FUNC = 'function';
var PENDING = 0;
var REJECTED = 1;
var FULFILLED = 2;

function p0() {
    this._state = PENDING;
    this._value = undef;
    this._cbs = [];
    this._ebs = [];
}

p0.is = function(x) {
    return x && typeof x.then === FUNC;
};

p0.nextTick = function(cb) {
    process.nextTick(cb, 0);
};

p0.prototype = {

    _exec: function(cbs) {
        var val = this._value;

        p0.nextTick(function() {
            var inf, res, pr;

            while (inf = cbs.shift()) {
                pr = inf.pr;

                try {
                    res = inf.cb(val);
                } catch(e) {
                    pr.reject(e);
                    continue;
                }

                if (p0.is(res)) {
                    res.then(pr.fulfill.bind(pr), pr.reject.bind(pr));
                } else {
                    pr.fulfill(res);
                }
            }
        });

    },

    reject: function(reason) {
        if (this._state === PENDING) {
            this._value = reason;
            this._state = REJECTED;
            this._exec(this._ebs);
        }
    },

    fulfill: function(value) {
        if (this._state === PENDING) {
            this._value = value;
            this._state = FULFILLED;
            this._exec(this._cbs);
        }
    },

    then: function(onFulfilled, onRejected) {

        var pr = new p0();
        var cb = typeof onFulfilled === FUNC ? onFulfilled : pr.fulfill.bind(pr);
        var eb = typeof onRejected === FUNC ? onRejected : pr.reject.bind(pr);

        switch (this._state) {

            case PENDING:
                this._cbs.push({cb: cb, pr: pr});
                this._ebs.push({cb: eb, pr: pr});
            break;

            case REJECTED:
                this._exec([ {cb: eb, pr: pr} ]);
            break;

            case FULFILLED:
                this._exec([ {cb: cb, pr: pr} ]);
            break;
        }

        return pr;
    }

};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = p0;
} else {
    root.p0 = p0;
}

})(this);
