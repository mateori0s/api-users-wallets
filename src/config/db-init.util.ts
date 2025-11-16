import { DataSource } from 'typeorm';

/**
 * Utility to ensure the development database exists before connecting.
 * This is particularly useful when:
 * - Someone clones the project for the first time
 * - The Docker container is reused with an existing volume
 * - The database name is changed
 */
export async function ensureDatabaseExists(): Promise<void> {
  const dbName = process.env.DB_NAME || 'users_wallets_dev';
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database to create target DB
  });

  try {
    await adminDataSource.initialize();

    // Check if database exists
    const result = await adminDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.length === 0) {
      // Database doesn't exist, create it
      await adminDataSource.query(`CREATE DATABASE "${dbName}";`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }
  } catch (error: any) {
    // Ignore error if database already exists
    if (error.code === '42P04' || error.message?.includes('already exists')) {
      console.log(`✅ Database '${dbName}' already exists`);
    } else {
      // For other errors, log a warning but don't fail
      // The AppDataSource initialization will handle the actual connection error
      console.warn(`⚠️  Could not verify/create database '${dbName}': ${error.message}`);
      console.warn(`   The application will attempt to connect anyway...`);
    }
  } finally {
    if (adminDataSource.isInitialized) {
      await adminDataSource.destroy();
    }
  }
}
