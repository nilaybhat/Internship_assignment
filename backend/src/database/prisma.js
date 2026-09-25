const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client for the whole application.
const prisma = new PrismaClient();

module.exports = prisma;