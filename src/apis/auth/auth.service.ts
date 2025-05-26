import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from 'src/base/models/user-payload.model';
import { JwtService } from '@nestjs/jwt';
import { appSettings } from 'src/configs/app-settings';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../users/user.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
      ) {
        this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      }

    async login(user: UserPayload) {
        const tokens = this.getTokens(user);
        return tokens;
    }

    private async getTokens(user: UserPayload) {
        const { _id } = user;

        const [refreshToken, accessToken] = await Promise.all([
            this.jwtService.signAsync(
                { _id },
                {
                    expiresIn: appSettings.jwt.refreshExpireIn,
                    secret: appSettings.jwt.refreshSecret,
                },
            ),
            this.jwtService.signAsync(user),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    //
    private generateRefreshToken(): string {
        return crypto.randomBytes(64).toString('hex');
      }
    
      async googleLogin(googleUser: any): Promise<{ access_token: string; refresh_token: string; user: User }> {
        let user = await this.usersService.findByGoogleId(googleUser.googleId);
        const refreshToken = this.generateRefreshToken();
        const payload = { email: googleUser.email, sub: user?._id.toString(), isPremium: user?.isPremium || false };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    
        if (!user) {
          user = await this.usersService.create({
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.avatar,
            auth: { googleId: googleUser.googleId },
            token: accessToken,
            refreshToken,
          });
        } else {
          user = await this.usersService.update(user._id.toString(), {
            auth: { ...user.auth, googleId: googleUser.googleId },
            name: googleUser.name,
            avatar: googleUser.avatar,
            token: accessToken,
            refreshToken,
          });
          if (!user) {
            throw new Error('Failed to update user');
          }
        }
    
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user,
        };
      }
    
      async googleLoginMobile(idToken: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
        try {
          const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload) {
            throw new UnauthorizedException('Invalid Google ID token');
          }
    
          const googleUser = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture,
          };
    
          return this.googleLogin(googleUser);
        } catch (error) {
          throw new UnauthorizedException('Google authentication failed');
        }
      }
    
      async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findByRefreshToken(refreshToken);
        if (!user) {
          throw new UnauthorizedException('Invalid refresh token');
        }
    
        const payload = { email: user.email, sub: user._id.toString() };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    
        await this.usersService.update(user._id.toString(), { token: accessToken });
    
        return { access_token: accessToken };
      }
    
      async logout(userId: string): Promise<void> {
        await this.usersService.update(userId, { token: undefined, refreshToken: undefined });
      }
}
