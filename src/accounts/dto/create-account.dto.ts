import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator"

export class CreateAccountDto {
    
    @IsNotEmpty()
    @IsString()
    owner: string

    @IsNotEmpty()
    @IsNumber()
    @MinLength(4)
    @MaxLength(4)
    pin: number
}