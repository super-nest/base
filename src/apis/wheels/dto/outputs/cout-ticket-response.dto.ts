import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDTO } from 'src/base/dto/outputs/api-response.dto';

export class CountTicketResponseDTO extends ApiResponseDTO<number> {
    @ApiProperty({ example: 3 })
    data: number;
}
