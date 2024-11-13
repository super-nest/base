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
    SWAP_TON = 'SWAP_TON',
    DRAFT_TON = 'DRAFT_TON',
    ROLLBACK_SWAP = 'ROLLBACK_SWAP',
    ROLLBACK_SWAP_DRAFT_TON = 'ROLLBACK_SWAP_DRAFT_TON',
    BUY_TICKET = 'BUY_TICKET',
}

export enum ParamTimeType {
    TODAY = 'Today',
    YESTERDAY = 'Yesterday',
    EARLIER = 'Earlier',
}
