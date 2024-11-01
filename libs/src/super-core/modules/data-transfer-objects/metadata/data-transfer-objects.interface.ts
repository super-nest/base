export interface DTOMetadataForm {
    [field: string]: {
        title: string;
        type: string;
        isArray: boolean;
        ref: string | null;
        required: boolean;
        isShow: boolean;
        widget: 'textarea' | null;
        form: DTOMetadata;
        enum: string[] | null;
        maxLength?: number;
        maximum?: number;
        minimum?: number;
        description?: string;
    };
}

export interface DTOMetadata {
    name: string;
    form: DTOMetadataForm;
}
