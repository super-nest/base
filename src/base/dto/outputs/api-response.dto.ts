import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDTO<T> {
    @ApiProperty({})
    data: T;

    @ApiProperty({ example: 'OK' })
    message: string;

    @ApiProperty({ example: 200 })
    statusCode: number;
}
