# red-maple

With red-maple you can map/reduce one stream to another, using JavaScript code for map and reduce functions.

## Install

```sh
npm install red-maple
```

## Usage

### CLI

Given a new-line delimited JSON file such as this:

```json
{"value":5}
{"value":3}
```

You can pipe the contents into the CLI tool and pipe the output to your destination

```sh
cat input.ndjson | red-maple --map "item * 2" --reduce "(memo || 0) + item" > output.txt
```

### Programmatic API

```js
const redMaple = require('red-maple')

redMaple({
  input: 'stdin',
  output: 'stdout',
  initial: 0,
  map (item) {
    return item * 2
  },
  reduce (memo, item) {
    return memo + item
  }
})
```

#### redMaple(options)

There's just a single function, which takes a few very powerful options.

##### options.input

This can be a named input pipe (stdin), a file path, or a readable stream. Will throw if the value is none of those.

##### options.output

This can be a named output pipe (stdout, stderr), a file path, or a writable stream. Will throw if the value is none of those.

##### options.map

This is the map function to transform your input records.

It can be a plain function, a json code fragment, or a path to a commonjs module or simple JavaScript file with just a single function in it. See the [ensure-function](https://npmjs.org/package/ensure-function) module for more information about valid uses.

##### options.reduce

This is an optional reduce function to reduce your transformed records to a single result.

It can be a plain function, a json code fragment, or a path to a commonjs module or simple JavaScript file with just a single function in it. See the [ensure-function](https://npmjs.org/package/ensure-function) module for more information about valid uses.

##### options.initial

The initial `memo` state for the reduce function to use.

##### options.parser

A custom parser stream can be given to consume data from _any_ format. By default, it will use `ndjson.parser()`.

##### options.serializer

A custom serializer stream can be given to product data in _any_ format. By default, it will use `ndjson.serializer()`.