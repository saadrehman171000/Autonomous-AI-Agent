import { ethers, JsonRpcProvider, formatEther, parseEther } from 'ethers';
import { WalletTransaction } from '../types';
import { logger } from '../utils/logger';

export class WalletService {
  private wallet: ethers.Wallet;
  private provider: JsonRpcProvider;

  constructor(privateKey: string, rpcUrl: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    logger.info('Initialized wallet service');
  }

  async getBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return formatEther(balance);
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  async sendTransaction(to: string, amount: string): Promise<WalletTransaction> {
    try {
      logger.info(`Sending ${amount} ETH to ${to}`);

      const tx = await this.wallet.sendTransaction({
        to,
        value: parseEther(amount),
      });

      const transaction: WalletTransaction = {
        id: tx.nonce.toString(),
        hash: tx.hash,
        from: this.wallet.address,
        to,
        value: amount,
        amount,
        currency: 'ETH',
        timestamp: new Date(),
        status: 'pending',
      };

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      return {
        ...transaction,
        status: receipt?.status === 1 ? 'completed' : 'failed',
      };
    } catch (error) {
      logger.error('Failed to send transaction:', error);
      throw error;
    }
  }

  async getTransaction(hash: string): Promise<WalletTransaction> {
    try {
      const tx = await this.provider.getTransaction(hash);
      if (!tx) {
        throw new Error(`Transaction ${hash} not found`);
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: formatEther(tx.value),
        amount: formatEther(tx.value),
        currency: 'ETH',
        timestamp: new Date(),
        status: tx.blockNumber ? 'confirmed' : 'pending',
      };
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  getAddress(): string {
    return this.wallet.address;
  }
}
