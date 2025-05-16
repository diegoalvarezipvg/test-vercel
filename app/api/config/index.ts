import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    version: process.env.npm_package_version || '1.0.0',
  },
  database: {
    url: process.env.DATABASE_URL || '',
    urlPostgres: process.env.POSTGRES_URL || '',
    urlPrisma: process.env.POSTGRES_PRISMA_URL || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1DAY',
  },
  logging: {
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  },
  cors: {
    allowedOrigins: isProd 
      ? [process.env.FRONTEND_URL || 'http://localhost:'+process.env.PORT] 
      : ['http://localhost:'+process.env.PORT, 'http://localhost:5174', 'localhost:5174'],
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'URL_ADDRESS-cantera.com',
  },
};