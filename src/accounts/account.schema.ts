import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "src/users/User.schema";

@Schema({timestamps: true}) 
export class Account {

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User"})
    owner: User

    @Prop()
    accountNumber: string

    @Prop()
    balance: number

    @Prop()
    pin: number

}

export const AccountSchema = SchemaFactory.createForClass(Account);