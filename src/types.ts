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
    DEPOSIT = "DEPOSIT",
    TRANSFER = "TRANSFER"
}

export interface ITransactionData {
    source: string
    destination: string
    amount: number
}

export interface ITransferResponse {
    source?: string
    destination: string
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

export type MyErrorResponseObj = {
    statusCode: number,
    timestamp: string,
    path: string,
    response: string | object,
}
