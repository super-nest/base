import { Controller, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PagesService } from '../pages.service';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { COLLECTION_NAMES } from 'src/constants';
import { Resource } from '@libs/super-authorize';
import { SuperGet } from '@libs/super-core';

@Controller('pages')
@Resource('pages')
@ApiTags('Front: Pages')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.PAGE,
})
export class PagesController {
    constructor(private readonly pagesService: PagesService) {}

    @SuperGet({ route: ':slug' })
    async getOne(@Param('slug') slug: string) {
        const result = await this.pagesService.model
            .findOne({ slug })
            .select({ createdBy: 0 })
            .autoPopulate()
            .exec();
        return result;
    }
}
