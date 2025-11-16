import { Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { AuthRequest } from '../middleware/auth.middleware';

const walletService = new WalletService();

export class WalletController {
  async getAllWallets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const wallets = await walletService.getWalletsByUserId(userId);
      res.json(wallets);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getWalletById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const wallet = await walletService.getWalletById(id, userId);
      res.json(wallet);
    } catch (error: any) {
      if (error.message === 'Wallet not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error',
        });
      }
    }
  }

  async createWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { tag, chain, address } = req.body;

      const wallet = await walletService.createWallet({
        userId,
        tag,
        chain,
        address,
      });

      res.status(201).json(wallet);
    } catch (error: any) {
      if (error.message === 'Wallet address already exists') {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error',
        });
      }
    }
  }

  async updateWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const { tag, chain, address } = req.body;

      // Only include fields that are provided (partial update)
      const updateData: any = {};
      if (tag !== undefined) updateData.tag = tag || null;
      if (chain !== undefined) updateData.chain = chain;
      if (address !== undefined) updateData.address = address;

      // Validate that at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'At least one field (tag, chain, or address) must be provided for update',
        });
        return;
      }

      const wallet = await walletService.updateWallet(id, userId, updateData);
      res.json(wallet);
    } catch (error: any) {
      if (error.message === 'Wallet not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          error: error.message,
        });
      } else if (error.message === 'Wallet address already exists') {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error',
        });
      }
    }
  }

  async deleteWallet(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      await walletService.deleteWallet(id, userId);
      res.json({
        success: true,
        message: 'Wallet deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Wallet not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Internal server error',
        });
      }
    }
  }
}

