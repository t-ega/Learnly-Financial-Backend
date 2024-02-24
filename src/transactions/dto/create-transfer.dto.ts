import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from "class-validator"

export class CreateTransferDto {
  /**
   * The source account number for the transaction
   */
  @IsNotEmpty()
  sourceAccountNumber: string;

  /**
   * The destination account number for the transaction
   */
  @IsNotEmpty()
  destinationAccountNumber: string;

  /**
   * The amount of the transaction
   */
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({message: "Amount must be greater than 0!"})
  amount: number;

  /**
   * The source pin for this transaction
   */
  @IsNotEmpty()
  @IsNumber()
  pin: number
}