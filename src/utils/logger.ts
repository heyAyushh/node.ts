import pino from 'pino';

// https://github.com/pinojs/pino/issues/673#issuecomment-506979971
const wrap = (logger: pino.Logger) => {
 const { error, child } = logger;
 function errorRearranger(this: any, ...args: any[]) {
  if (typeof args[0] === 'string' && args.length > 1) {
   for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof Error) {
     const [err] = args.splice(i, 1);
     args.unshift(err);
    }
   }
  }
  return error.apply(this, args);
 }
 function childModifier(this: any, ...args: any[]): pino.Logger {
  const c = child.apply(this, args);
  c.error = errorRearranger;
  c.child = childModifier;
  return c;
 }
 logger.error = errorRearranger;
 logger.child = childModifier;
 return logger;
};

const isDevelopment = process.env.NODE_ENV === 'development';

const getLogger = () => (isDevelopment ? wrap(pino({
 level: process.env.DEV_LOG_LEVEL,
 prettyPrint: { colorize: true },
 timestamp: true,
})) : wrap(pino({
 level: process.env.PROD_LOG_LEVEL,
 timestamp: pino.stdTimeFunctions.isoTime,
})));

// level: process.env.DEV_LOG_LEVEL,
// prettyPrint: { colorize: true },
// translateTime: true,
// timestamp: isDevelopment ? true : pino.stdTimeFunctions.isoTime,
// useMetadata: true,

// catch all the ways node might exit

const logger = getLogger();

// const handler = pino.final(logger, (err, finalLogger, evt) => {
//  finalLogger.info(`${evt} caught`);
//  if (err) finalLogger.error(err, 'error caused exit');
//  process.exit(err ? 1 : 0);
// });

// process.on('beforeExit', () => handler(null, 'beforeExit'));
// process.on('exit', () => handler(null, 'exit'));
// process.on('uncaughtException', (err) => handler(err, 'uncaughtException'));
// process.on('SIGINT', () => handler(null, 'SIGINT'));
// process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
// process.on('SIGTERM', () => handler(null, 'SIGTERM'));

export default logger;
