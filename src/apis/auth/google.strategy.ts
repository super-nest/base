import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
    console.log('Google Strategy Config:', {
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('Google Profile:', profile);
      const { id, emails, displayName, photos } = profile;
      const user = {
        googleId: id,
        email: emails[0].value,
        name: displayName,
        avatar: photos[0]?.value,
        accessToken,
      };
      done(null, user);
    } catch (error) {
      console.error('Google Validate Error:', error);
      done(error, null);
    }
  }
}