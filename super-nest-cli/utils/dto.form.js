export const createDto = (name) => {
    return `import { PartialType } from '@nestjs/swagger';
import { ExcludeDto } from 'src/base/dto/exclude.dto';
export class Create${name[5]}Dto extends PartialType(ExcludeDto) {}
`;
};
export const updateDto = (name) => {
    return `import { PartialType } from '@nestjs/swagger';
import { Create${name[5]}Dto } from './create-${name[0]}.dto';

export class Update${name[5]}Dto extends PartialType(Create${name[5]}Dto) {}
`;
};
