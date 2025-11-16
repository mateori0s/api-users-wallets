import 'reflect-metadata';
import { TestDataSource } from '../config/test-data-source';
import { clearBlacklist } from '../utils/token-blacklist.util';
import { DataSource } from 'typeorm';

/**
 * Test Setup
 * 
 * AppDataSource is already mocked by mock-data-source.ts (loaded via setupFiles)
 * to use TestDataSource, which connects to a separate test database (users_wallets_test).
 * 
 * This allows tests to use a separate test database without modifying production code.
 * 
 * synchronize: true ensures tables are automatically created/updated
 * based on entity definitions without needing migrations.
 */

/**
 * Create test database if it doesn't exist
 */
async function ensureTestDatabaseExists(): Promise<void> {
  const testDbName = process.env.DB_NAME_TEST || 'users_wallets_test';
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database to create test DB
  });

  try {
    await adminDataSource.initialize();
    
    // Check if database exists
    const result = await adminDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [testDbName]
    );

    if (result.length === 0) {
      // Database doesn't exist, create it
      await adminDataSource.query(`CREATE DATABASE "${testDbName}";`);
      console.log(`✅ Test database '${testDbName}' created successfully`);
    } else {
      console.log(`✅ Test database '${testDbName}' already exists`);
    }
  } catch (error: any) {
    // Ignore error if database already exists
    if (error.code !== '42P04' && error.message?.includes('already exists')) {
      console.log(`✅ Test database '${testDbName}' already exists`);
    } else if (!error.message?.includes('already exists')) {
      console.warn(`⚠️  Could not create test database automatically: ${error.message}`);
      console.warn('   You may need to create it manually: CREATE DATABASE users_wallets_test;');
    }
  } finally {
    if (adminDataSource.isInitialized) {
      await adminDataSource.destroy();
    }
  }
}

// Global test setup
beforeAll(async () => {
  // Create test database if it doesn't exist
  await ensureTestDatabaseExists();
  
  // Initialize test database connection
  if (!TestDataSource.isInitialized) {
    try {
      await TestDataSource.initialize();
      console.log('✅ Test database connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to test database:', error);
      throw error;
    }
  }
});

// Global test teardown
afterAll(async () => {
  // Close test database connection after all tests
  if (TestDataSource.isInitialized) {
    await TestDataSource.destroy();
    console.log('✅ Test database connection closed');
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear blacklist after each test
  clearBlacklist();
});

