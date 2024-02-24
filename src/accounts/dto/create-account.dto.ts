import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator"

export class CreateAccountDto {
    
    @IsNotEmpty()
    @IsString()
    owner: string

    @IsNotEmpty()
    @IsNumber()
    @Min(3)
    pin: number
}