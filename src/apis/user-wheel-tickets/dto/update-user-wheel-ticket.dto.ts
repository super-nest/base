import { SuperApiProperty } from '@libs/super-core/decorators/super-api-property.decorator';
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsIn } from 'class-validator';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
import { TicketStatus } from '../constant';

export class UpdateUserWheelTicketDto extends PartialType(ExcludeDto) {
    @SuperApiProperty({
        type: String,
        required: true,
        description: 'Status for Ticket',
        title: 'Status',
        enum: [TicketStatus.USED],
        default: TicketStatus.USED,
    })
    @IsEnum(TicketStatus)
    @IsIn([TicketStatus.USED])
    status: TicketStatus.USED;
}
