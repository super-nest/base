import { SuperApiProperty } from '@libs/super-core';
import { Tag } from '../../entities/tags.entity';
import { MultipleLanguageType } from '@libs/super-multiple-language';
import { FileDocument } from 'src/apis/media/entities/files.entity';
import { ResultMediaDto } from 'src/apis/media/dto/outputs/result-media.dto';
import { SEOTagDto } from 'src/apis/pages/dto/create-pages.dto';
import { SEOTag } from 'src/apis/pages/entities/pages.entity';

export class ResultTagDto extends Tag {
    @SuperApiProperty({
        type: String,
    })
    name: MultipleLanguageType;

    @SuperApiProperty({
        type: String,
    })
    slug: string;

    @SuperApiProperty({
        type: ResultMediaDto,
    })
    featuredImage: FileDocument;

    @SuperApiProperty({
        type: SEOTagDto,
    })
    seoTag: SEOTag;
}
