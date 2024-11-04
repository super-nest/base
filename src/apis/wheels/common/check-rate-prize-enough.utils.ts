import { BadRequestException } from '@nestjs/common';
import { Prize } from '../entities/wheels.entity';

export const checkRatePrizeEnough = (prizes: Prize[]) => {
    const totalRate = prizes.reduce((acc, prize) => acc + prize.rate, 0);
    const roundedTotalRate = Math.round(totalRate * 100) / 100;

    if (roundedTotalRate !== 100) {
        throw new BadRequestException('Total rate of prize must be 100');
    }
};
