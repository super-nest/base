import { ApiResponseDTO } from 'src/base/dto/outputs/api-response.dto';
import { ResultWheelDto } from './result-wheel.dto';
import { SuperApiProperty } from '@libs/super-core';

export class GetWheelResponseDTO extends ApiResponseDTO<ResultWheelDto> {
    @SuperApiProperty({
        type: ResultWheelDto,
    })
    data: ResultWheelDto;
}
