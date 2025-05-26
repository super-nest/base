import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { UserLoginDto } from '../dto/user-login.dto';
import { UserPayload } from 'src/base/models/user-payload.model';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { Resource } from '@libs/super-authorize';
import { Me } from 'src/decorators/me.decorator';

@Controller()
@Resource()
@ApiTags('Admin: Auth')
@AuditLog({
    events: [
        AUDIT_EVENT.GET,
        AUDIT_EVENT.POST,
        AUDIT_EVENT.PUT,
        AUDIT_EVENT.DELETE,
    ],
    refSource: COLLECTION_NAMES.USER,
})
export class AuthControllerAdmin {
    constructor(private readonly authService: AuthService) {}

    @SuperPost({ route: 'login', input: UserLoginDto })
    @UseGuards(LocalAuthGuard)
    async login(@Me() user: UserPayload) {
        if (!user) {
            return undefined;
        }
        return await this.authService.login(user);
    }
}
