#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js'
import http from 'http';
import Debug from "debug";
const debug = Debug('server-test:server');
import dotenv from 'dotenv';
dotenv.config();
import prisma from '../configs/prisma.js';

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '6005');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

/**
 * Graceful shutdown: close server then disconnect Prisma connection pool.
 */
async function shutdown(signal: string) {
  debug(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    debug('Prisma disconnected. Exiting.');
    process.exit(0);
  });
  // Force exit after 10 s if connections don't drain
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

/**
 * Log unhandled promise rejections so they don't silently accumulate listeners.
 */
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
