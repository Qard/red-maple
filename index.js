const ensureFunction = require('ensure-function')
const ensureStream = require('ensure-stream')
const ndjson = require('ndjson')

function maybeStringInput ({ input, parser = ndjson.parse() } = {}) {
  const stream = ensureStream.readable(input)
  if (stream) {
    return stream.pipe(parser)
  }

  throw new Error('Input must be a readable stream, named input pipe or file path')
}

function maybeStringOutput ({ output, serializer = ndjson.serialize() } = {}) {
  const stream = ensureStream.writable(output)
  if (stream) {
    serializer.pipe(stream)
    return serializer
  }

  throw new Error('Output must be a writable stream, named output pipe or file path')
}

module.exports = function redMaple (options = {}) {
  const input = maybeStringInput(options)
  const output = maybeStringOutput(options)

  const map = ensureFunction(options.map, ['item'])
  const reduce = options.reduce && ensureFunction(options.reduce, ['memo', 'item'])

  let memo = options.initial
  input
    .on('data', item => {
      const mapped = map(item)
      if (reduce) {
        memo = reduce(memo, mapped)
      } else {
        output.write(mapped)
      }
    })
    .on('end', () => {
      if (reduce) {
        output.write(memo)
      }
      output.end()
    })
}