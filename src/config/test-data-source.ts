import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Wallet } from '../entities/Wallet';

/**
 * Test DataSource Configuration
 * 
 * This DataSource is specifically for running tests.
 * It uses a separate database (users_wallets_test) to avoid
 * affecting production/development data.
 * 
 * synchronize: true is enabled for tests to automatically
 * create/update tables without needing migrations.
 */
export const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME_TEST || 'users_wallets_test',
  entities: [User, Wallet],
  synchronize: true, // Auto-create/update tables in test environment
  logging: false, // Disable logging in tests for cleaner output
  dropSchema: false, // Keep schema, just clean data
});

