import 'dotenv/config';
import logger from './utils/logger';

logger.info(`Hello World ${(process.env.EMOJI || '🚀')}`);
