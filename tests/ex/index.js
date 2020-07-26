const testdata = require('tsc-checkjs-broken-dep')

testdata.foo(1)

function notUsed(foo) {
    return foo.length
}