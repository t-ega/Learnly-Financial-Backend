import { Request } from "express"

export interface IRequestPayload extends Request {
    user : Ipayload,
    idempotencyKey?: string
}

export interface Ipayload {
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
}

export interface ITransferResponse {
    sourceAccountNumber: string
    destinationAccountNumber: string
    amount: number
    success: boolean
}

export interface IUser {
     firstname: string
     lastname: string
     email: string
     phoneNumber: string
}

export interface IAccountDetails {
    owner: IUser
    balance: number
    accountNumber: string
}
