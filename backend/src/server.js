const app = require('./app');
const { port } = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(port, () => {
  console.log(`AppCentre API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
