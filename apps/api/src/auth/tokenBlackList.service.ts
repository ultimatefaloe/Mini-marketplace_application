import { Global, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Global()
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis({
      url: this.config.get<string>('UPSTASH_REDIS_REST_URL'),
      token: this.config.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  async blacklistToken(token: string, expiresIn: number) {
    try {
      // Upstash uses PX for ms, EX for seconds. Here we use EX for seconds.
      await this.client.set(token, 'blacklisted', { ex: expiresIn });
    } catch (err) {
      this.logger.error('Failed to blacklist token:', err.message);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await this.client.get(token);
      return result === 'blacklisted';
    } catch (err) {
      this.logger.error('Failed to check token:', err.message);
      return false;
    }
  }
}