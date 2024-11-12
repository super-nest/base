import _ from 'lodash';
import { PipelineStage, ProjectionType } from 'mongoose';

export const projectionConfig = (
    pipeline: PipelineStage[],
    projection?: ProjectionType<any> | null,
) => {
    const projections = projection.toString().split(' ');

    const project = projections.reduce((acc, cur) => {
        const _cur = cur.split('-');
        if (_cur.length > 1) {
            acc[_cur[1]] = 0;
        } else {
            acc[cur] = 1;
        }

        return acc;
    }, {});

    pipeline.push({ $project: project });
};

export const sortPipelines = (pipeline: PipelineStage[]): PipelineStage[] => {
    if (pipeline.length === 0) return pipeline;

    const topLevelMatches: PipelineStage[] = [];
    const deeperLevelMatches: PipelineStage[] = [];
    const project: PipelineStage[] = [];
    const others: PipelineStage[] = [];
    const addFields: PipelineStage[] = [];
    const limit: PipelineStage[] = [];
    const skip: PipelineStage[] = [];
    const count: PipelineStage[] = [];
    const sort: PipelineStage[] = [];

    for (const stage of pipeline) {
        if (_.has(stage, '$match')) {
            const level = matchLevel(stage);
            if (level === 1) {
                topLevelMatches.push(stage);
            } else {
                deeperLevelMatches.push(stage);
            }
        } else if (_.has(stage, '$project')) {
            project.push(stage);
        } else if (_.has(stage, '$addFields')) {
            addFields.push(stage);
        } else if (_.has(stage, '$limit')) {
            limit.push(stage);
        } else if (_.has(stage, '$skip')) {
            skip.push(stage);
        } else if (_.has(stage, '$count')) {
            count.push(stage);
        } else if (_.has(stage, '$sort')) {
            sort.push(stage);
        } else {
            others.push(stage);
        }
    }

    return [
        ...topLevelMatches,
        ...others,
        ...deeperLevelMatches,
        ...project,
        ...addFields,
        ...sort,
        ...skip,
        ...limit,
        ...count,
    ];
};

export const deleteAllLookup = (pipeline: PipelineStage[]): PipelineStage[] => {
    return pipeline.filter(
        (stage) =>
            !_.has(stage, '$lookup') &&
            !_.has(stage, '$unwind') &&
            !_.has(stage, '$addFields'),
    );
};

export const matchLevel = (stage: PipelineStage): number => {
    if (_.has(stage, '$match')) {
        const matchObj = stage.$match;
        const keys = Object.keys(matchObj);
        if (['$and', '$or'].includes(keys[0])) {
            return 2;
        }

        return keys.some((key) => key.includes('.')) ? 2 : 1;
    }
    return 0;
};
