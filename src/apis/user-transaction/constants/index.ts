export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserTransactionType {
    SUB = 'SUB',
    SUM = 'SUM',
}

export enum UserCacheKey {
    USER_BANNED = 'USER_BANNED',
}

export enum UserTransactionAction {
    REFERRAL = 'REFERRAL',
    REFERRED = 'REFERRED',
    WHEEL = 'WHEEL',
    SWAP = 'SWAP',
    DRAFT_TON = 'DRAFT_TON',
    ROLLBACK_SWAP = 'ROLLBACK_SWAP',
    BUY_TICKET = 'BUY_TICKET',
}

export enum ParamTimeType {
    TODAY = 'Today',
    YESTERDAY = 'Yesterday',
    EARLIER = 'Earlier',
}
