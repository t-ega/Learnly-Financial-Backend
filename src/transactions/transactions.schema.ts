import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Account } from "src/accounts/account.schema";
import { TransactionType } from "src/types";

@Schema({timestamps : true})
export class Transaction {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "Account"})
    source: Account

    @Prop({type: TransactionType, required: true})
    transactionType : TransactionType // Transfer or Deposit

    @Prop({type: mongoose.Schema.Types.ObjectId, required: true})
    destination: Account

    @Prop({required: true})
    amount: number

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);