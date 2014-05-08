;(function(root, undef) {

var FUNC = 'function';
var REJECT = 'reject';
var FULFILL = 'fulfill';
var PENDING = 0;

function p0() {
    this._act = PENDING;
    this._val = undef;
    this._cbs = [];
    this._ebs = [];
}

p0.nextTick = function(cb) {
    setTimeout(cb, 0);
};

p0.prototype = {

    _exec: function(cbs) {
        var val = this._val;
        var act = this._act;

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

                pr[cb ? FULFILL : act](res);
            }
        });

    },

    reject: function(reason) {
        if (this._act === PENDING) {
            this._val = reason;
            this._act = REJECT;
            this._exec(this._ebs);
        }
    },

    fulfill: function(value) {
        var then, tof, that = this, pending = 1;

        if (this._act === PENDING) {

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
                this._val = value;
                this._act = FULFILL;
                this._exec(this._cbs);
            }
        }
    },

    then: function(cb, eb) {

        var pr = new p0();

        if (this._act === PENDING) {
            this._cbs.push({cb: cb, pr: pr});
            this._ebs.push({cb: eb, pr: pr});
        } else {
            this._exec([ {cb: this._act == REJECT ? eb : cb, pr: pr} ]);
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
