import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class WithdrawalDto {
    @IsString()
    @IsNotEmpty()
    source: string;

    @IsNotEmpty()
    @IsString()
    destination: string;

    @IsNotEmpty()
    @IsPositive()
    amount: number;

    @IsNotEmpty()
    @IsString()
    destinationBankName: string;

    @IsNotEmpty()
    pin: string;
}