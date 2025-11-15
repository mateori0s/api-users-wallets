import { AppDataSource } from '../config/data-source';
import { Wallet } from '../entities/Wallet';
import { User } from '../entities/User';

export interface CreateWalletInput {
  userId: string;
  tag?: string;
  chain: string;
  address: string;
}

export interface UpdateWalletInput {
  tag?: string;
  chain?: string;
  address?: string;
}

export class WalletService {
  private walletRepository = AppDataSource.getRepository(Wallet);
  private userRepository = AppDataSource.getRepository(User);

  async createWallet(walletData: CreateWalletInput): Promise<Wallet> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: walletData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if address already exists
    const existingWallet = await this.walletRepository.findOne({
      where: { address: walletData.address },
    });

    if (existingWallet) {
      throw new Error('Wallet address already exists');
    }

    // Create wallet
    const wallet = this.walletRepository.create({
      userId: walletData.userId,
      tag: walletData.tag || null,
      chain: walletData.chain,
      address: walletData.address,
    });

    return await this.walletRepository.save(wallet);
  }

  async getWalletById(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.userId !== userId) {
      throw new Error('Access denied');
    }

    return wallet;
  }

  async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    return await this.walletRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async updateWallet(id: string, userId: string, updateData: UpdateWalletInput): Promise<Wallet> {
    const wallet = await this.getWalletById(id, userId);

    // Check if new address already exists (if address is being updated)
    if (updateData.address && updateData.address !== wallet.address) {
      const existingWallet = await this.walletRepository.findOne({
        where: { address: updateData.address },
      });

      if (existingWallet) {
        throw new Error('Wallet address already exists');
      }
    }

    // Update wallet
    Object.assign(wallet, updateData);
    return await this.walletRepository.save(wallet);
  }

  async deleteWallet(id: string, userId: string): Promise<void> {
    const wallet = await this.getWalletById(id, userId);
    await this.walletRepository.remove(wallet);
  }
}

