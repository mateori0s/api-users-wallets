import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Wallet } from '../entities/Wallet';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wallets_db',
  entities: [User, Wallet],
  synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in development
  logging: process.env.NODE_ENV === 'development',
});

