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
        var val = this._val, act = this._act;

        p0.nextTick(function() {
            var inf, pr, cb;

            while (inf = cbs.shift()) {
                pr = inf.pr;
                cb = isFunction(inf.cb);

                if (cb) {
                    try {
                        pr.fulfill(cb(val));
                    } catch(e) {
                        pr.reject(e)
                    }
                } else {
                    pr[act](val);
                }
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

        if (that._act === PENDING) {

            try {
                if (value === that) { throw TypeError(); }
                tof = value && typeof value;
                then = (tof === FUNC || tof === 'object') && value.then;
            } catch (e) {
                that.reject(e);
                return;
            }

            if (isFunction(then)) {
                try {
                    then.call(value,
                        function(v) { pending = pending && that.fulfill(v); },
                        function(r) { pending = pending && that.reject(r); }
                    );
                } catch(e) {
                    if (pending) { that.reject(e); }
                }
            } else {
                that._val = value;
                that._act = FULFILL;
                that._exec(that._cbs);
            }
        }
    },

    then: function(cb, eb) {

        var that = this, pr = new p0();

        if (that._act === PENDING) {
            that._cbs.push({cb: cb, pr: pr});
            that._ebs.push({cb: eb, pr: pr});
        } else {
            that._exec([ {cb: that._act == REJECT ? eb : cb, pr: pr} ]);
        }

        return pr;
    }

};

if (typeof module != 'undefined' && module.exports) {
    module.exports = p0;
} else {
    root.p0 = p0;
}

function isFunction(val) { return typeof val === FUNC && val; }

})(this);
