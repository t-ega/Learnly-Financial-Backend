import { Request } from "express"
import { Document } from "mongoose"

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

export enum TransactionType {
    DEPOSIT = "DEPOSIT",
    TRANSFER = "TRANSFER"
}

export interface ITransactionData {
    source: string
    destination: string
    amount: number
}

export interface IAccount extends Document {
    owner: {
        id?: string, role?: UserRoles
    } 
    balance: number
    accountNumber: string
    pin: string
}

export interface ITransaction extends Document {
    source?: string
    transactionType: TransactionType
    destination: string
    amount: number
}

export interface IUser extends Document {
     firstname: string
     lastname: string
     email: string
     phoneNumber: string
    role: UserRoles
}

export interface ITransferResponse {
    source?: string
    destination: string
    amount: number
    success: boolean
}

export interface IUser extends Document {
    firstname: string
    password: string
    lastname: string
    email: string
    phoneNumber: string
    isActive: boolean
    role: UserRoles
}
export interface IUser extends Document {
     firstname: string
     lastname: string
     email: string
     phoneNumber: string
    role: UserRoles
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
