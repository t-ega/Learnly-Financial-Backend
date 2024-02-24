import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "src/users/User.schema";

@Schema({timestamps: true}) 
export class Account {

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User"})
    owner: User

    @Prop()
    accountNumber: string

    @Prop({default: 0})
    balance: number

    @Prop()
    pin: string //the pin would be hashed to prevent compromization

}

export const AccountSchema = SchemaFactory.createForClass(Account);