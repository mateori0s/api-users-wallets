import { TestDataSource } from '../../config/test-data-source';
import { User } from '../../entities/User';
import { Wallet } from '../../entities/Wallet';
import bcrypt from 'bcryptjs';

/**
 * Helper functions for tests
 * 
 * Uses TestDataSource which connects to a separate test database
 * (users_wallets_test) to avoid affecting production/development data.
 */

/**
 * Clean database using TRUNCATE (more efficient than DELETE)
 * 
 * TRUNCATE:
 * - Faster than DELETE for removing all rows
 * - Resets auto-increment counters (RESTART IDENTITY)
 * - Handles foreign key constraints automatically (CASCADE)
 * - More efficient for clearing tables between tests
 */
export const cleanDatabase = async (): Promise<void> => {
  if (TestDataSource.isInitialized) {
    const queryRunner = TestDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      // TRUNCATE both tables in one operation
      // CASCADE automatically handles foreign key dependencies
      // RESTART IDENTITY resets auto-increment counters
      await queryRunner.query(`
        TRUNCATE TABLE wallets, users 
        RESTART IDENTITY 
        CASCADE;
      `);
      
    } catch (error) {
      console.error('Error cleaning test database:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
};

export const createTestUser = async (email: string, password: string): Promise<User> => {
  const userRepository = TestDataSource.getRepository(User);
  // Hash password if it's not already hashed
  const hashedPassword = password.startsWith('$2a$') || password.startsWith('$2b$') 
    ? password 
    : await bcrypt.hash(password, 10);
    
  const user = userRepository.create({
    email,
    password: hashedPassword,
  });
  return await userRepository.save(user);
};

export const createTestWallet = async (
  userId: string,
  chain: string,
  address: string,
  tag?: string
): Promise<Wallet> => {
  const walletRepository = TestDataSource.getRepository(Wallet);
  const wallet = walletRepository.create({
    userId,
    chain,
    address,
    tag: tag || null,
  });
  return await walletRepository.save(wallet);
};

export const getTestUser = async (email: string): Promise<User | null> => {
  const userRepository = TestDataSource.getRepository(User);
  return await userRepository.findOne({ where: { email } });
};

export const getTestWallet = async (walletId: string): Promise<Wallet | null> => {
  const walletRepository = TestDataSource.getRepository(Wallet);
  return await walletRepository.findOne({ where: { id: walletId } });
};

