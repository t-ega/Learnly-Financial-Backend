import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    lastLogin?: Date
}

export class UpdateUserDtoFromEndpoint extends PartialType(CreateUserDto){};