const tap = require('tap')
const spawn = require('cross-spawn')

tap.test('typescript compiler', {}, (ct) => {
  const p = spawn.sync('../../node_modules/.bin/tsc', ['--noImplicitAny', '-p', 'jsconfig.json'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns failed statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'node_modules/tsc-checkjs-broken-dep/index.js', 'has node module error')
  ct.end()
})

tap.test('tsc-checkjs', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', 'two-errors.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns failed statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'Filtered out 1 error entries.', 'filters out one node module error')
  ct.contains(stdout, 'Found 1 errors.', 'emits source code error')
  ct.end()
})

tap.test('tsc-checkjs accepts compiler options', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '--noImplicitAny', 'two-errors.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns failed statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'Filtered out 1 error entries.', 'filters out one node module error')
  ct.contains(stdout, 'Found 2 errors.', 'emits source code errors')
  ct.contains(stdout, 'TS7006', 'TS7006 found')
  ct.end()
})

tap.test('tsc-checkjs', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', 'no-errors.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 0, 'returns ok statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'Filtered out 1 error entries.', 'filters out one node module error')
  ct.contains(stdout, 'Found 0 errors.', 'emits source code error')
  ct.end()
})
