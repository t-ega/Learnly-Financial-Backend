import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { User } from "src/users/User.schema";

@Schema({timestamps: true}) 
export class Account extends Document {

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User", required: true})
    owner: User

    @Prop({ unique: true, required: true})
    accountNumber: string

    @Prop({default: 0})
    balance: number

    @Prop({ required: true})
    pin: string //the pin would be hashed to prevent compromization

}

export const AccountSchema = SchemaFactory.createForClass(Account);