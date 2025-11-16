import request from 'supertest';
import app from '../../../app';
import { cleanDatabase, createTestUser, createTestWallet } from '../../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../utils/jwt.util';

describe('Wallet Endpoints - Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let secondUserToken: string;
  let secondUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Create first test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await createTestUser('test@example.com', hashedPassword);
    userId = user.id;
    authToken = generateToken(user.id);

    // Create second test user for access control tests
    const secondUser = await createTestUser('test2@example.com', hashedPassword);
    secondUserId = secondUser.id;
    secondUserToken = generateToken(secondUser.id);
  });

  describe('GET /api/wallets', () => {
    it('should return empty array when user has no wallets', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return all wallets for authenticated user', async () => {
      // Create test wallets
      await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');
      await createTestWallet(userId, 'Bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      const response = await request(app)
        .get('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('chain');
      expect(response.body[0]).toHaveProperty('address');
      expect(response.body[0]).toHaveProperty('userId', userId);
    });

    it('should only return wallets belonging to the authenticated user', async () => {
      // Create wallet for first user
      await createTestWallet(userId, 'Ethereum', '0x1111111111111111');
      // Create wallet for second user
      await createTestWallet(secondUserId, 'Bitcoin', '0x2222222222222222');

      const response = await request(app)
        .get('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].userId).toBe(userId);
      expect(response.body[0].address).toBe('0x1111111111111111');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/wallets')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('GET /api/wallets/:id', () => {
    let walletId: string;

    beforeEach(async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef', 'My Wallet');
      walletId = wallet.id;
    });

    it('should return wallet by id for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', walletId);
      expect(response.body).toHaveProperty('chain', 'Ethereum');
      expect(response.body).toHaveProperty('address', '0x1234567890abcdef');
      expect(response.body).toHaveProperty('tag', 'My Wallet');
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should return 404 for non-existent wallet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/wallets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Wallet not found');
    });

    it('should return 403 when accessing another user wallet', async () => {
      // Create wallet for second user
      const secondWallet = await createTestWallet(secondUserId, 'Bitcoin', '0x2222222222222222');

      const response = await request(app)
        .get(`/api/wallets/${secondWallet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/wallets/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/wallets', () => {
    it('should create a new wallet successfully', async () => {
      const walletData = {
        chain: 'Ethereum',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        tag: 'My Ethereum Wallet',
      };

      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(walletData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('chain', walletData.chain);
      expect(response.body).toHaveProperty('address', walletData.address);
      expect(response.body).toHaveProperty('tag', walletData.tag);
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should create wallet without tag (optional field)', async () => {
      const walletData = {
        chain: 'Bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      };

      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(walletData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('chain', walletData.chain);
      expect(response.body).toHaveProperty('address', walletData.address);
      expect(response.body.tag).toBeNull();
    });

    it('should return 400 if chain is missing', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: '0x1234567890abcdef',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 if address is missing', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chain: 'Ethereum',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 if address already exists', async () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      await createTestWallet(userId, 'Ethereum', address);

      const response = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chain: 'Bitcoin',
          address: address,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Wallet address already exists');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/api/wallets')
        .send({
          chain: 'Ethereum',
          address: '0x1234567890abcdef',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/wallets/:id', () => {
    let walletId: string;

    beforeEach(async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef', 'Original Tag');
      walletId = wallet.id;
    });

    it('should update wallet successfully', async () => {
      const updateData = {
        chain: 'Bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        tag: 'Updated Tag',
      };

      const response = await request(app)
        .put(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', walletId);
      expect(response.body).toHaveProperty('chain', updateData.chain);
      expect(response.body).toHaveProperty('address', updateData.address);
      expect(response.body).toHaveProperty('tag', updateData.tag);
    });

    it('should allow partial update (only chain)', async () => {
      const response = await request(app)
        .put(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chain: 'Bitcoin',
        })
        .expect(200);

      expect(response.body).toHaveProperty('chain', 'Bitcoin');
      expect(response.body).toHaveProperty('address', '0x1234567890abcdef');
    });

    it('should return 400 if no fields provided for update', async () => {
      const response = await request(app)
        .put(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('At least one field');
    });

    it('should return 404 for non-existent wallet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/wallets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chain: 'Bitcoin',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Wallet not found');
    });

    it('should return 403 when updating another user wallet', async () => {
      const secondWallet = await createTestWallet(secondUserId, 'Bitcoin', '0x2222222222222222');

      const response = await request(app)
        .put(`/api/wallets/${secondWallet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          chain: 'Ethereum',
        })
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('DELETE /api/wallets/:id', () => {
    let walletId: string;

    beforeEach(async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');
      walletId = wallet.id;
    });

    it('should delete wallet successfully', async () => {
      const response = await request(app)
        .delete(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Wallet deleted successfully');

      // Verify wallet is deleted
      const getResponse = await request(app)
        .get(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('error', 'Wallet not found');
    });

    it('should return 404 for non-existent wallet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/wallets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Wallet not found');
    });

    it('should return 403 when deleting another user wallet', async () => {
      const secondWallet = await createTestWallet(secondUserId, 'Bitcoin', '0x2222222222222222');

      const response = await request(app)
        .delete(`/api/wallets/${secondWallet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });
});

