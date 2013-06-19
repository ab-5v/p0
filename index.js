;(function(root, undef) {

var FUNC = 'function';
    PENDING = 0;
    REJECTED = 1;
    FULFILLED = 2;

function pzero() {
    this._state = PENDING;
    this._value = undef;
    this._cbs = [];
    this._ebs = [];
}

pzero.is = function(x) {
    return x && typeof x.then === FUNC;
};

pzero.nextTick = function(cb) {
    setTimeout(cb, 0);
};

pzero.prototype = {

    _exec: function(cbs) {
        var val = this._value;

        pzero.nextTick(function() {
            var inf, res;

            while (inf = cbs.shift()) {

                try {
                    res = inf.cb(val);
                } catch(e) {
                    inf.pr.reject(e);
                    continue;
                }

                if (pzero.is(res)) {
                    inf.pr.pipe(res);
                } else {
                    inf.pr.fulfill(res);
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

    pipe: function(pr) {
        pr.then(this.fulfill.bind(this), this.reject.bind(this));
    },

    then: function(onFulfilled, onRejected) {

        var pr = new pzero();
        var cb = typeof onFulfilled === FUNC && onFulfilled;
        var eb = typeof onRejected === FUNC && onRejected;

        if (!cb && !eb) {
            pr.pipe(this);
        } else {
            switch (this._state) {

                case PENDING:
                    cb && this._cbs.push({cb: cb, pr: pr});
                    eb && this._ebs.push({cb: eb, pr: pr});
                break;

                case REJECTED:
                    eb && this._exec([ {cb: eb, pr: pr} ]);
                break;

                case FULFILLED:
                    cb && this._exec([ {cb: cb, pr: pr} ]);
                break;
            }
        }

        return pr;
    }

};

module.exports = pzero;

})(this);
