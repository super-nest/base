import { BadGatewayException } from '@nestjs/common';
import dayjs from 'dayjs';
import { Types } from 'mongoose';

export const removeDiacritics = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const convertStringToObjectId = (value: any, isArray = false) => {
    if (!value) {
        return null;
    }

    if (isArray) {
        return value.map((val) => {
            const trimmedVal = val.trim();
            if (!Types.ObjectId.isValid(trimmedVal)) {
                throw new BadGatewayException(
                    `Invalid ObjectId: ${trimmedVal}`,
                );
            }

            return new Types.ObjectId(trimmedVal);
        });
    }

    if (!Types.ObjectId.isValid(value)) {
        throw new BadGatewayException(`Invalid ObjectId: ${value}`);
    }

    return new Types.ObjectId(value);
};
export const resetMissionTime = () => {
    return new Date().setHours(0, 0, 0, 0);
};

export const compareToday = (dateFromApi: Date): boolean => {
    const today = dayjs().startOf('day');
    const isSameDay = dayjs(dateFromApi).isAfter(today);

    return isSameDay;
};

export const hasOneHourPassed = (timestamp: Date): boolean => {
    const now = dayjs();

    return now.isAfter(dayjs(timestamp).add(1, 'hour'));
};

export const cleanOrigin = (origin: string): string => {
    return origin ? origin.replace(/(^\w+:|^)\/\//, '') : '';
};

export const cleanOrigins = (origins: string[]): string[] => {
    return origins.map((origin) => cleanOrigin(origin));
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
