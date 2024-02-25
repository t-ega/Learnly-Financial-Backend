import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserRoles } from "../types";

@Schema({timestamps: true})
export class User {
    @Prop({required: true})
    firstname: string;

    @Prop({ required: true})
    lastname: string

    @Prop({unique: true, required: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true, unique: true})
    phoneNumber: string

    @Prop({default: true})
    isActive: boolean // if the user isnt active they wont be able to carry out operations on their account

    @Prop({default: UserRoles.REGULAR, enum: UserRoles})
    role: UserRoles;

    @Prop({type: Date})
    lastLogin: Date;
}


export const UserSchema = SchemaFactory.createForClass(User)