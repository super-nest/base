import { SuperApiProperty } from '@libs/super-core';
import { File } from '../../entities/files.entity';

export class ResultMediaDto extends File {
    @SuperApiProperty({
        type: String,
    })
    filePath: string;

    @SuperApiProperty({
        type: String,
    })
    name: string;

    @SuperApiProperty({
        type: String,
    })
    filename: string;

    @SuperApiProperty({ type: String })
    folder: string;

    @SuperApiProperty({ type: String })
    note: string;

    @SuperApiProperty({ type: String })
    mime: string;

    @SuperApiProperty({ type: Number })
    size: number;

    @SuperApiProperty({ type: String })
    alt: string;
}
