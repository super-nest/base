import { Model, PipelineStage, Document } from 'mongoose';
import { ModuleRef } from '@nestjs/core';

export class CustomQueryBaseService<T extends Document> {
    protected id: string;
    protected collectionName: string;
    protected model: Model<T>;
    protected conditions: Record<string, any> = {};
    protected pipeline: PipelineStage[] = [];
    public static moduleRef: ModuleRef;
    protected entity: new () => any;

    constructor(
        model: Model<T>,
        entity: new () => any,
        collectionName: string,
        moduleRef: ModuleRef,
        conditions: Record<string, any> = {},
        pipeline: PipelineStage[] = [],
    ) {
        this.id = CustomQueryBaseService.name;
        CustomQueryBaseService.moduleRef = moduleRef;
        this.model = model;
        this.conditions = conditions;
        this.pipeline = pipeline;
        this.collectionName = collectionName;
        this.entity = entity;
    }
}
