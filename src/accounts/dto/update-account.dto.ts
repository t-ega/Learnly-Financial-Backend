import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateAccountDto {
    @IsString()
    owner?: string

    @IsNumber()
    @IsPositive()
    balance?: number

    @IsNumber()
    @MinLength(4)
    @MaxLength(4)
    pin?: number
}