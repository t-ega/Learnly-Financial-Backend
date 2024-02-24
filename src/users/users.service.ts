import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './User.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from "bcrypt"

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User>{
    /**
     * Create a new user in the system
     * @param createUserDto - User details for registration
     * @returns The created user
     * @throws HttpException with a status code 400 if the password and confirm password do not match
     */
    await this.userModel.deleteMany();

    const { password, confrimPassword, ...userObject } = createUserDto;

    if (confrimPassword !== password) {
      throw new HttpException("Password and confirm password must match", HttpStatus.BAD_REQUEST);
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userModel.create({ password: hashedPassword, ...userObject });
    return user.save();
  }

  async getUsers(): Promise<User[]>{
    /**
     * Retrieve all users in the system
     * @returns All users in the system
     */
    return this.userModel.find();
  }

  async getUserByEmail(email: string): Promise<User>{
    /**
     * Retrieve a user by their email
     * @param email - The email of the user to retrieve
     * @returns The user with the specified email
     */
    return await this.userModel.findOne({ email });
  }

  async getUserById(id: string): Promise<User>{
    /**
     * Retrieve a user by their ID
     * @param id - The ID of the user to retrieve
     * @returns The user with the specified ID
     */
    return await this.userModel.findById(id);
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<User>{
    /**
     * Update a user by their ID
     * @param id - The ID of the user to update
     * @param updateUserDto - Updated user details
     * @returns The updated user
     */
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async suspendOrEnableUserAccount(userId: string, reason: string): Promise<void>{
    /**
     * Suspend a user's account by setting the `isActive` property to false.
     * Log the reason why the user was suspended to the logger.s
     */
    const user = await this.userModel.findById(userId);
    user.isActive = !user.isActive; // suspend or re-enable it
    user.save()
  }

  async deleteUserById(id: string): Promise<User>{
    /**
     * Delete a user by their ID
     * @param id - The ID of the user to delete
     */
    return await this.userModel.findByIdAndDelete(id);
  }
}