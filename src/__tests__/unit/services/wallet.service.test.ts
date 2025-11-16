import { WalletService } from '../../../services/wallet.service';
import { cleanDatabase, createTestUser, createTestWallet } from '../../helpers/test-helpers';

describe('WalletService - Unit Tests', () => {
  let walletService: WalletService;
  let userId: string;
  let secondUserId: string;

  beforeEach(async () => {
    await cleanDatabase();
    walletService = new WalletService();

    // Create test users
    const user1 = await createTestUser('user1@example.com', 'password123');
    const user2 = await createTestUser('user2@example.com', 'password123');
    userId = user1.id;
    secondUserId = user2.id;
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const walletData = {
        userId,
        chain: 'Ethereum',
        address: '0x1234567890abcdef',
        tag: 'My Wallet',
      };

      const wallet = await walletService.createWallet(walletData);

      expect(wallet).toBeDefined();
      expect(wallet.id).toBeDefined();
      expect(wallet.userId).toBe(userId);
      expect(wallet.chain).toBe(walletData.chain);
      expect(wallet.address).toBe(walletData.address);
      expect(wallet.tag).toBe(walletData.tag);
    });

    it('should create wallet without tag', async () => {
      const walletData = {
        userId,
        chain: 'Bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      };

      const wallet = await walletService.createWallet(walletData);

      expect(wallet).toBeDefined();
      expect(wallet.tag).toBeNull();
    });

    it('should throw error if user does not exist', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      
      await expect(
        walletService.createWallet({
          userId: fakeUserId,
          chain: 'Ethereum',
          address: '0x1234567890abcdef',
        })
      ).rejects.toThrow('User not found');
    });

    it('should throw error if address already exists', async () => {
      const address = '0x1234567890abcdef';
      
      // Create first wallet
      await createTestWallet(userId, 'Ethereum', address);

      // Try to create duplicate
      await expect(
        walletService.createWallet({
          userId,
          chain: 'Bitcoin',
          address: address,
        })
      ).rejects.toThrow('Wallet address already exists');
    });

    it('should allow same address for different users', async () => {
      // This test verifies business logic - if we want to allow same address for different users
      // Currently, address is unique globally, so this test expects an error
      const address = '0x1234567890abcdef';
      
      await createTestWallet(userId, 'Ethereum', address);

      // Try to create same address for different user
      await expect(
        walletService.createWallet({
          userId: secondUserId,
          chain: 'Ethereum',
          address: address,
        })
      ).rejects.toThrow('Wallet address already exists');
    });
  });

  describe('getWalletById', () => {
    it('should get wallet by id for owner', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      const foundWallet = await walletService.getWalletById(wallet.id, userId);

      expect(foundWallet).toBeDefined();
      expect(foundWallet.id).toBe(wallet.id);
      expect(foundWallet.userId).toBe(userId);
    });

    it('should throw error if wallet not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        walletService.getWalletById(fakeId, userId)
      ).rejects.toThrow('Wallet not found');
    });

    it('should throw error if user is not owner', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      await expect(
        walletService.getWalletById(wallet.id, secondUserId)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getWalletsByUserId', () => {
    it('should get all wallets for user', async () => {
      await createTestWallet(userId, 'Ethereum', '0x1111111111111111');
      await createTestWallet(userId, 'Bitcoin', '0x2222222222222222');
      await createTestWallet(secondUserId, 'Ethereum', '0x3333333333333333');

      const wallets = await walletService.getWalletsByUserId(userId);

      expect(wallets).toHaveLength(2);
      wallets.forEach(wallet => {
        expect(wallet.userId).toBe(userId);
      });
    });

    it('should return empty array if user has no wallets', async () => {
      const wallets = await walletService.getWalletsByUserId(userId);

      expect(wallets).toEqual([]);
    });

    it('should return wallets ordered by created_at DESC', async () => {
      const wallet1 = await createTestWallet(userId, 'Ethereum', '0x1111111111111111');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const wallet2 = await createTestWallet(userId, 'Bitcoin', '0x2222222222222222');

      const wallets = await walletService.getWalletsByUserId(userId);

      expect(wallets).toHaveLength(2);
      // Most recent should be first
      expect(wallets[0].id).toBe(wallet2.id);
      expect(wallets[1].id).toBe(wallet1.id);
    });
  });

  describe('updateWallet', () => {
    it('should update wallet successfully', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef', 'Old Tag');

      const updatedWallet = await walletService.updateWallet(wallet.id, userId, {
        chain: 'Bitcoin',
        address: '0x9876543210fedcba',
        tag: 'New Tag',
      });

      expect(updatedWallet.chain).toBe('Bitcoin');
      expect(updatedWallet.address).toBe('0x9876543210fedcba');
      expect(updatedWallet.tag).toBe('New Tag');
    });

    it('should allow partial update', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef', 'Old Tag');

      const updatedWallet = await walletService.updateWallet(wallet.id, userId, {
        tag: 'New Tag',
      });

      expect(updatedWallet.tag).toBe('New Tag');
      expect(updatedWallet.chain).toBe('Ethereum'); // Should remain unchanged
      expect(updatedWallet.address).toBe('0x1234567890abcdef'); // Should remain unchanged
    });

    it('should throw error if wallet not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        walletService.updateWallet(fakeId, userId, { chain: 'Bitcoin' })
      ).rejects.toThrow('Wallet not found');
    });

    it('should throw error if user is not owner', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      await expect(
        walletService.updateWallet(wallet.id, secondUserId, { chain: 'Bitcoin' })
      ).rejects.toThrow('Access denied');
    });

    it('should throw error if new address already exists', async () => {
      const existingAddress = '0x9999999999999999';
      await createTestWallet(userId, 'Bitcoin', existingAddress);
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      await expect(
        walletService.updateWallet(wallet.id, userId, { address: existingAddress })
      ).rejects.toThrow('Wallet address already exists');
    });

    it('should allow updating to same address', async () => {
      const address = '0x1234567890abcdef';
      const wallet = await createTestWallet(userId, 'Ethereum', address);

      const updatedWallet = await walletService.updateWallet(wallet.id, userId, {
        address: address, // Same address
        chain: 'Bitcoin',
      });

      expect(updatedWallet.address).toBe(address);
      expect(updatedWallet.chain).toBe('Bitcoin');
    });
  });

  describe('deleteWallet', () => {
    it('should delete wallet successfully', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      await walletService.deleteWallet(wallet.id, userId);

      // Verify wallet is deleted
      await expect(
        walletService.getWalletById(wallet.id, userId)
      ).rejects.toThrow('Wallet not found');
    });

    it('should throw error if wallet not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await expect(
        walletService.deleteWallet(fakeId, userId)
      ).rejects.toThrow('Wallet not found');
    });

    it('should throw error if user is not owner', async () => {
      const wallet = await createTestWallet(userId, 'Ethereum', '0x1234567890abcdef');

      await expect(
        walletService.deleteWallet(wallet.id, secondUserId)
      ).rejects.toThrow('Access denied');
    });
  });
});

