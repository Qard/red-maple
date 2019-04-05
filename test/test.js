const { Transform, Writable } = require('stream')

const concat = require('concat-stream')
const ensureFunction = require('ensure-function')
const intoStream = require('into-stream')
const tap = require('tap')

const redMaple = require('../')

const numbers = [1, 2, 3]

function noop () {}

tap.test('map', t => {
  t.plan(1)

  function map (item) {
    return item.value * 2
  }

  const inputs = numbers.map(value => ({ value }))
  const output = inputs.map(map).join('\n')

  redMaple({
    input: intoStream(inputs.map(v => JSON.stringify(v)).join('\n')),
    output: concat(result => {
      t.equal(result.toString(), `${output}\n`, 'received expected output')
    }),
    map
  })
})

tap.test('map + reduce', t => {
  t.plan(1)

  function map (item) {
    return item.value * 2
  }

  function reduce (memo, item) {
    return (memo || 0) + item
  }

  const inputs = numbers.map(value => ({ value }))
  const output = inputs.map(map).reduce(reduce)

  redMaple({
    input: intoStream(inputs.map(v => JSON.stringify(v)).join('\n')),
    output: concat(result => {
      t.equal(result.toString(), `${output}\n`, 'received expected output')
    }),
    map,
    reduce
  })
})

tap.test('expression map + reduce', t => {
  t.plan(1)

  const map = ensureFunction('item.value * 2', ['item'])
  const reduce = ensureFunction('(memo || 0) + item', ['memo', 'item'])

  const inputs = numbers.map(value => ({ value }))
  const output = inputs.map(map).reduce(reduce)

  redMaple({
    input: intoStream(inputs.map(v => JSON.stringify(v)).join('\n')),
    output: concat(result => {
      t.equal(result.toString(), `${output}\n`, 'received expected output')
    }),
    map,
    reduce
  })
})

tap.test('initial reduce value', t => {
  t.plan(1)

  function map (item) {
    return item.value * 2
  }

  function reduce (memo, item) {
    return (memo || 0) + item
  }

  const inputs = numbers.map(value => ({ value }))
  const output = inputs.map(map).reduce(reduce)

  redMaple({
    input: intoStream(inputs.map(v => JSON.stringify(v)).join('\n')),
    output: concat(result => {
      t.equal(result.toString(), `${(output + 2)}\n`, 'received expected output')
    }),
    map,
    reduce,
    initial: 2
  })
})

tap.test('custom parser + serializer', t => {
  t.plan(3)

  function map (item) {
    return item.value * 2
  }

  function reduce (memo, item) {
    return (memo || 0) + item
  }

  const inputs = numbers.map(value => ({ value }))
  const output = inputs.map(map).reduce(reduce)

  let parsed = 0
  const parser = new Transform({
    objectMode: true,
    transform (chunk, encoding, callback) {
      parsed++
      callback(null, chunk, encoding)
    }
  })

  let serialized = 0
  const serializer = new Transform({
    objectMode: true,
    transform (chunk, encoding, callback) {
      serialized++
      callback(null, chunk, encoding)
    }
  })

  const outputStream = new Writable({
    objectMode: true,
    write (chunk, encoding, callback) {
      t.equal(chunk, output, 'output matches')
      t.equal(parsed, 3, 'parsed expected number of items')
      t.equal(serialized, 1, 'serialized expected number of items')
      callback(null, chunk, encoding)
    }
  })

  redMaple({
    input: intoStream.object(inputs),
    parser,
    serializer,
    output: outputStream,
    map,
    reduce
  })
})

tap.test('reject invalid input stream', t => {
  t.throws(() => {
    redMaple({
      input: 1,
      output: concat(noop),
      map: noop,
      reduce: noop
    })
  }, /Input must be a readable stream, named input pipe or file path/)
  t.end()
})

tap.test('reject invalid output stream', t => {
  const inputs = numbers.map(value => ({ value }))
  t.throws(() => {
    redMaple({
      input: intoStream(inputs.map(v => JSON.stringify(v)).join('\n')),
      output: 2,
      map: noop,
      reduce: noop
    })
  }, /Output must be a writable stream, named output pipe or file path/)
  t.end()
})
