import { PartialType } from '@nestjs/swagger';
import { CreateWheelsDto } from './create-wheels.dto';

export class UpdateWheelsDto extends PartialType(CreateWheelsDto) {}
