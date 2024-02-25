import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Account } from "src/accounts/account.schema";
import { TransactionType } from "src/types";

@Schema({timestamps : true})
export class Transaction {
    // can be from an external service or internal
    // if it is internal it would be from a user's account and this field would be populated.
    @Prop({type: String, ref: "Account"})
    source?: string 

    @Prop({type: String, required: true})
    transactionType : TransactionType // Transfer or Deposit

    @Prop({type: String, required: true})
    destination: string

    @Prop({required: true})
    amount: number

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);