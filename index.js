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
    setTimeout(cb, 0);
};

p0.prototype = {

    _exec: function(cbs) {
        var val = this._value;

        p0.nextTick(function() {
            var inf, res, pr, cb, then;

            while (inf = cbs.shift()) {
                pr = inf.pr;
                cb = inf.cb;

                try {
                    res = cb(val);
                } catch(e) {
                    pr.reject(e);
                    continue;
                }

                pr.fulfill(res);
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
        var resolved, then, tof, that = this;

        if (this._state === PENDING) {

            try {
                if (value === this) { throw TypeError(); }
                tof = typeof value;
                then = (tof === FUNC || tof === 'object' && value !== null) && value.then;
            } catch (e) {
                this.reject(e);
                return;
            }

            if (typeof then === FUNC) {
                try {
                    then.call(value, function(value) {
                        if (!resolved) {
                            resolved = 1;
                            that.fulfill(value);
                        }
                    }, function(reason) {
                        if (!resolved) {
                            resolved = 1;
                            that.reject(reason);
                        }
                    });
                } catch(e) {
                    resolved || this.reject(e);
                }
            } else {
                this._value = value;
                this._state = FULFILLED;
                this._exec(this._cbs);
            }
        }
    },

    then: function(onFulfilled, onRejected) {

        var pr = new p0();
        var cb = typeof onFulfilled === FUNC ? onFulfilled : bind(pr, 'fulfill');
        var eb = typeof onRejected === FUNC ? onRejected : bind(pr, 'reject');

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

function bind(obj, meth) { return function(val) { return obj[meth](val); }; }

})(this);
