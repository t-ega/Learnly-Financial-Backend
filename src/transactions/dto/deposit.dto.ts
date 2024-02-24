import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from "class-validator"

export class CreateDepositDto {
  /**
   * The destination account number for the transaction
   */
  @IsNotEmpty()
  destination: string;

  /**
   * The amount of the transaction
   */
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({message: "Amount must be greater than 0!"})
  amount: number;
}