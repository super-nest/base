import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { TicketStatus } from '../constant';

export class CreateUserWheelTicketDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        required: false,
        description: 'Status for Ticket',
        title: 'Status',
        enum: TicketStatus,
        default: TicketStatus.NEW,
    })
    @IsEnum(TicketStatus)
    status: TicketStatus;
}
