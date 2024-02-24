import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator"
import { TransactionType } from "src/types";

export class TransactionDto {
  /**
   * The source account number for the transaction, maybe empty if it is a deposit
   */
  @IsNotEmpty()
  source: string;

  /**
   * The destination account number for the transaction
   */
  @IsNotEmpty()
  destination: string;

    /**
    * The type of transaction 
    */
   @IsNotEmpty()
   @IsEnum(TransactionType)
   transactionType: TransactionType

  /**
   * The amount of the transaction
   */
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({message: "Amount must be greater than 0!"})
  amount: number;

  /**
   * The source pin for this transaction.Maybe empty if it is a deposit
   */
  @IsNumber()
  pin?: number
}