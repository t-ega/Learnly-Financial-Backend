import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class TransactionDto {
  /**
   * The source account number for the transaction
   */
  @IsNotEmpty()
  @IsString()
  source: string;

  /**
   * The destination account number for the transaction
   */
  @IsNotEmpty()
  @IsString()
  destination: string;

  /**
   * The amount of the transaction
   */
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}