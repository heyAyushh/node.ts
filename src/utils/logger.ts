import pino from 'pino';

// https://github.com/pinojs/pino/issues/673#issuecomment-506979971
const wrap = (logger: pino.BaseLogger) => {
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
    function childModifier(this: any, ...args: any[]) {
        const c = child.apply(this, args);
        c.error = errorRearranger;
        c.child = childModifier;
        return c;
    }
    logger.error = errorRearranger;
    logger.child = childModifier;
    return logger;
};

const isDevelopment = process.env.NODE_ENV === 'development' ? true : false

const getLogger = () => isDevelopment ? wrap(pino({
    level: process.env.DEV_LOG_LEVEL,
    prettyPrint: { colorize: true },
    timestamp: isDevelopment ? true : pino.stdTimeFunctions.isoTime,
})) : wrap(pino({
    level: process.env.PROD_LOG_LEVEL,
    timestamp: isDevelopment ? true : pino.stdTimeFunctions.isoTime
}))

// level: process.env.DEV_LOG_LEVEL,
// prettyPrint: { colorize: true },
// translateTime: true,
// timestamp: isDevelopment ? true : pino.stdTimeFunctions.isoTime,
// useMetadata: true,

const logger = getLogger();

export default logger;
