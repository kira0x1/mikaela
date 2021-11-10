import { createLogger, format, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import * as config from '../config';

const loggerTransports = [];

if (config.isProduction) {
   const esTransport = new ElasticsearchTransport({
      level: 'info',
      indexPrefix: 'mikaela',
      clientOpts: {
         node: config.elasticServer,
         auth: { username: config.elasticUser, password: config.elasticPass }
      }
   });

   loggerTransports.push(esTransport);

   esTransport.on('error', error => {
      console.error('Error in logger caught', error);
   });
}

loggerTransports.push(new transports.Console());

// Create logger
export const logger = createLogger({
   format: format.combine(format.timestamp(), format.json()),
   defaultMeta: { service: 'mikaela' },
   transports: loggerTransports
});

// Compulsory error handling
logger.on('error', error => {
   console.error('Error in logger caught', error);
});
