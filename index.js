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

p0.nextTick = function(cb) {
    setTimeout(cb, 0);
};

p0.prototype = {

    _exec: function(cbs) {
        var val = this._value;
        var act = this._state === REJECTED ? 'reject' : 'fulfill';

        p0.nextTick(function() {
            var inf, res, pr, cb;

            while (inf = cbs.shift()) {
                pr = inf.pr;
                cb = isFunction(inf.cb);

                try {
                    res = cb ? cb(val) : val;
                } catch(e) {
                    pr.reject(e);
                    continue;
                }

                pr[cb ? 'fulfill' : act ](res);
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
        var then, tof, that = this, pending = 1;

        if (this._state === PENDING) {

            try {
                if (value === this) { throw TypeError(); }
                tof = value && typeof value;
                then = (tof === FUNC || tof === 'object') && value.then;
            } catch (e) {
                this.reject(e);
                return;
            }

            if (isFunction(then)) {
                try {
                    then.call(value,
                        function(v) { pending = pending && that.fulfill(v); },
                        function(r) { pending = pending && that.reject(r); }
                    );
                } catch(e) {
                    if (pending) { this.reject(e); }
                }
            } else {
                this._value = value;
                this._state = FULFILLED;
                this._exec(this._cbs);
            }
        }
    },

    then: function(cb, eb) {

        var pr = new p0();

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

function isFunction(val) { return typeof val === FUNC && val; }

})(this);
