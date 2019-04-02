const pino = require('pino')
const yargs = require('yargs')

const redMaple = require('./')

const argv = yargs
  .usage('./$0 - map and reduce logs in JavaScript with red-maple!')
  .options({
    input: {
      alias: 'i',
      describe: 'input source',
      default: 'stdin'
    },
    output: {
      alias: 'o',
      describe: 'output destination',
      default: 'stdout'
    },
    map: {
      alias: 'm',
      describe: 'map function',
      demandOption: true
    },
    reduce: {
      alias: 'r',
      describe: 'reduce function'
    },
    initial: {
      alias: 'I',
      describe: 'initial reducer value'
    },
    // TODO: improve logger handling...
    logger: {
      alias: 'l',
      describe: 'log level',
      default: 'silent',
      coerce (level) {
        return pino({
          name: 'maple',
          prettyPrint: true,
          level
        }, pino.destination(2))
      }
    }
  })
  .help()
  .argv

process.on('uncaughtException', pino.final(argv.logger, (err, finalLogger) => {
  finalLogger.error(err, 'uncaughtException')
  process.exit(1)
}))

redMaple(argv)
