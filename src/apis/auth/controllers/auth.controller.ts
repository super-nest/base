import { Controller, Get, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { AuthService } from '../auth.service';
import { Resource } from '@libs/super-authorize';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
@Resource()
@ApiTags('Front: Auth')
@AuditLog({
    events: [
        AUDIT_EVENT.GET,
        AUDIT_EVENT.POST,
        AUDIT_EVENT.PUT,
        AUDIT_EVENT.DELETE,
    ],
    refSource: COLLECTION_NAMES.USER,
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}
  
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
      try {
        const result = await this.authService.googleLogin(req.user);
        res.cookie('refresh_token', result.refresh_token, { httpOnly: true, secure: false });
        return res.json({
          access_token: result.access_token,
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
          },
        });
        
      } catch (error) {
        console.error('Google login error:', error.message, error.stack);
        res.redirect('http://localhost:3000/api/front/auth/login/error');
      }
    }
  
    @Post('google/mobile')
    async googleMobileLogin(@Body('id_token') idToken: string, @Res() res: Response) {
      try {
        const result = await this.authService.googleLoginMobile(idToken);
        res.cookie('refresh_token', result.refresh_token, { httpOnly: true, secure: false });
        return res.json({
          access_token: result.access_token,
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
          },
        });
      } catch (error) {
        console.error('Google mobile login error:', error.message, error.stack);
        return res.status(401).json({ message: 'Google authentication failed' });
      }
    }
  
    @Post('refresh-token')
    async refreshToken(@Body('refresh_token') refreshToken: string) {
      return this.authService.refreshToken(refreshToken);
    }
  
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req) {
      await this.authService.logout(req.user.sub);
      return { message: 'Logged out successfully' };
    }
}


