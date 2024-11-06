import { COLLECTION_NAMES } from 'src/constants';

export const populateGroupPrizeAggregate = [
    {
        $unwind: {
            path: '$prizes',
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $lookup: {
            from: COLLECTION_NAMES.FILE,
            localField: 'prizes.image',
            foreignField: '_id',
            as: 'fileDetails',
        },
    },
    {
        $unwind: {
            path: '$fileDetails',
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $group: {
            _id: '$_id',
            fee: { $first: '$fee' },
            limit: { $first: '$limit' },
            coolDownTime: { $first: '$coolDownTime' },
            coolDownValue: { $first: '$coolDownValue' },
            ticketPrize: { $first: '$ticketPrize' },
            ticketPrizeShare: { $first: '$ticketPrizeShare' },
            prizes: {
                $push: {
                    prize: '$prizes.prize',
                    rate: '$prizes.rate',
                    name: '$prizes.name',
                    type: '$prizes.type',
                    image: '$fileDetails',
                    description: '$prizes.description',
                    category: '$prizes.category',
                    _id: '$prizes._id',
                },
            },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
        },
    },
];
