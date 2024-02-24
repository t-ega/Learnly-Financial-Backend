import {IsEmail, IsStrongPassword, IsString, MinLength, MaxLength, IsPhoneNumber} from "class-validator";

export class CreateUserDto {
    // regular fields
    @IsString()
    @MaxLength(10)
    @MinLength(3)
    firstname: string


    @IsString()
    @MaxLength(10)
    @MinLength(3)
    lastname: string


    @IsEmail()
    email: string

    @IsStrongPassword(
    {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    }, 
    {
        message: "Password must contain at least 1 uppercase, 1 lowercase, 1 symbol and a minimum length of 8 characters" 
    })
    password: string

    // N.B: check would still be made in the provider class to ensure both passwords match.
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    }, {message: "Confrim password must contain at least 1 uppercase, 1 lowercase, 1 symbol and a minimum length of 8 characters" })
    confrimPassword: string
    
    @IsPhoneNumber(null, {message: "Must be a valid phone number e.g +234-9013489921 "})
    phoneNumber: number

}