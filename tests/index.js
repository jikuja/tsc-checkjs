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

tap.test('tsc-checkjs supports glob', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '*.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns error statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'Filtered out 1 error entries.', 'filters out one node module error')
  ct.contains(stdout, 'Found 1 errors.', 'emits source code error')
  // TODO: parse debug output to find out list of globbed files. Or test globbing method
  ct.end()
})

tap.test('tsc-checkjs ignores glob', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '--skipGlob', '*.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns error statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'TS6053', 'emits file not found error')
  ct.contains(stdout, '*.js', 'has nonexpanded argument')
  ct.end()
})

tap.test('tsc-checkjs prints help', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '--help'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 0, 'returns ok statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, 'Usage:')
  ct.end()
})

tap.test('tsc-checkjs fails with unknown command line argument', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '--doesnotexistandwillfail', '*.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  ct.equal(p.status, 1, 'returns error statuscode')
  const stdout = p.stdout.toString()
  ct.contains(stdout, '--doesnotexistandwillfail', 'argument is printed back')
  ct.contains(stdout, 'Unknown compiler option', 'generic error message')
  ct.end()
})

tap.test('tsc-checkjs supports --pretty', {}, (ct) => {
  const p = spawn.sync('node', ['../../index.js', '--pretty', 'two-errors.js'], {
    stdio: 'pipe',
    cwd: 'tests/ex'
  })

  const stdout = p.stdout.toString()
  ct.contains(stdout, '\u001b', 'output contains color codes')
  ct.end()
})