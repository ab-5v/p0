<a href="http://promises-aplus.github.com/promises-spec"><img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png" align="right" alt="Promises/A+ logo"/></a>
p0 [![build status](https://secure.travis-ci.org/artjock/pzero.png)](http://travis-ci.org/artjock/p0)
==

Minimal and fast Promise/A+ 1.1 implementation. It's all you need to pass the [tests](https://github.com/promises-aplus/promises-tests) and build your own [extended API](https://github.com/artjock/pzero).

### Installation

#### Node.js
```
npm install p0
```

#### Browser
```
<script src="p0/index.min.js"></script>
```

### Usage

```javascript
var p0 = require('./');

var promise1 = new p0();

var promise2 = promise1.then(
    null,
    function(reason) {
        var promise3 = new p0();
        setTimeout(function() {
            promise3.fulfill(reason + 'bar');
        }, 100);
        return promise3;
    }
);

promise1.reject('foo');

promise2.then(function(value) { console.log(value); });
// will output "foobar" after 100ms
```

Fill free to use [specs](http://promisesaplus.com/) as more descriptive documentation.

### License
MIT
