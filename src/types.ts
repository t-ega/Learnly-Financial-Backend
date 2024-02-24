export interface ISignInResponse {
    id: string
    role: UserRoles
}

export enum UserRoles {
    REGULAR = "REGULAR",
    ADMIN = "ADMIN"
}

export enum TransactionType{
    DEPOSIT,
    TRANSFER
}

export interface ITransactionData {
    source: string
    destination: string
    amount: number
    idempotencyKey: string // used to cache the transaction in order to avoid duplicate transactions.
}