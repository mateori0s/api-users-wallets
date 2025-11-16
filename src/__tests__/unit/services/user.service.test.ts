import { UserService } from '../../../services/user.service';
import { cleanDatabase, createTestUser } from '../../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import { TestDataSource } from '../../../config/test-data-source';
import { User } from '../../../entities/User';

describe('UserService - Unit Tests', () => {
  let userService: UserService;

  beforeEach(async () => {
    await cleanDatabase();
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash is long
      
      // Verify password is hashed correctly
      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      // Create user first
      await createTestUser(userData.email, userData.password);

      // Try to create duplicate
      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should hash password with bcrypt', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await userService.createUser(userData);

      // Verify it's a bcrypt hash
      expect(user.password).toMatch(/^\$2[aby]\$/);
      
      // Verify we can verify the password
      const isValid = await bcrypt.compare(userData.password, user.password);
      expect(isValid).toBe(true);
    });

    it('should create user with unique ID', async () => {
      const user1 = await userService.createUser({
        email: 'user1@example.com',
        password: 'password123',
      });

      const user2 = await userService.createUser({
        email: 'user2@example.com',
        password: 'password123',
      });

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      // Create user
      await createTestUser(email, password);

      const result = await userService.signIn({ email, password });

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user does not exist', async () => {
      await expect(
        userService.signIn({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password is incorrect', async () => {
      const email = 'test@example.com';
      const correctPassword = 'password123';
      
      // Create user
      await createTestUser(email, correctPassword);

      // Try to sign in with wrong password
      await expect(
        userService.signIn({
          email,
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should generate valid JWT token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      await createTestUser(email, password);

      const result = await userService.signIn({ email, password });

      // Token should be a string
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should return user without password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      await createTestUser(email, password);

      const result = await userService.signIn({ email, password });

      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBeDefined();
    });
  });

  describe('signUp', () => {
    it('should create user and return token', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const result = await userService.signUp(userData);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.id).toBeDefined();
    });

    it('should throw error if email already exists during signup', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      // Create user first
      await createTestUser(userData.email, userData.password);

      // Try to sign up with same email
      await expect(userService.signUp(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should hash password during signup', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await userService.signUp(userData);

      // Verify user was created with hashed password
      const user = await TestDataSource.getRepository(User).findOne({
        where: { email: userData.email },
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(userData.password);
      expect(user!.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = await createTestUser('test@example.com', 'password123');

      const foundUser = await userService.findById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(user.id);
      expect(foundUser!.email).toBe(user.email);
    });

    it('should return null if user not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const foundUser = await userService.findById(fakeId);

      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      await createTestUser(email, 'password123');

      const foundUser = await userService.findByEmail(email);

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      const foundUser = await userService.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });
});

