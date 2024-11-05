import { Body, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { COLLECTION_NAMES } from 'src/constants';
import { AuditLog } from 'src/packages/audits/decorators/audits.decorator';
import { AUDIT_EVENT } from 'src/packages/audits/constants';
import { FormBuilderService } from '../form-builders.service';
import { CreateFormBuildersDto } from '../dto/create-form-builders.dto';
import { SuperPost } from '@libs/super-core/decorators/super-post.decorator';
import { Resource } from '@libs/super-authorize';

@Controller('form-builders')
@Resource('form-builders')
@ApiTags('Front: Form Builder')
@AuditLog({
    events: [AUDIT_EVENT.POST, AUDIT_EVENT.PUT, AUDIT_EVENT.DELETE],
    refSource: COLLECTION_NAMES.FORM_BUILDER,
})
export class FormBuilderController {
    constructor(private readonly formBuilderService: FormBuilderService) {}

    @SuperPost({ input: CreateFormBuildersDto })
    async create(@Body() createFormBuilderDto: CreateFormBuildersDto) {
        const result = await this.formBuilderService.createOne(
            createFormBuilderDto,
        );

        return result;
    }
}
