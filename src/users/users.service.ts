import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from "bcrypt"
import * as _ from "lodash";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './User.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from 'src/types';

@Injectable()
export class UsersService {
  /**
   * This class ensures that Users should be able to register,
   *  log in, and access protected resources based on their roles.
   * Some endpoints are limited to only admins,these endpoints include:
   * getUsers
   * 
   * 
   * Note: This service doesnt support operations like update/delete on the users model.
   * 
   * @param userModel User model to interact with.
   */

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto){
    /**
     * Create a new user in the system
     * @param createUserDto - User details for registration
     * @returns The created user
     * @throws HttpException with a status code 400 if the password and confirm password do not match
     */

    // check if a user with that email or phone number exists
    const exists = await this.userModel.exists(
      { $or: [{email: createUserDto.email}, {phoneNumber: createUserDto.phoneNumber}]}
    );

    if (exists) throw new HttpException("A user with that email or phone number already exists", HttpStatus.BAD_REQUEST);

    const { password, confrimPassword, ...userObject } = createUserDto;

    if (confrimPassword !== password) {
      throw new HttpException("Password and confirm password must match", HttpStatus.BAD_REQUEST);
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.userModel({ password: hashedPassword, ...userObject });
    await user.save()
    
    return _.pick(user.save(), ["firstname", "lastname", "email", "phoneNumber"]);
  }

  async getUsers(): Promise<IUser[]>{
    /**
     * Retrieve all users in the system
     * @returns All users in the system
     */
    return this.userModel.find();
  }

  async getUserByEmail(email: string): Promise<IUser>{
    /**
     * Retrieve a user by their email
     * @param email - The email of the user to retrieve
     * @returns The user with the specified email
     */
    return await this.userModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser>{
    /**
     * Retrieve a user by their ID
     * @param id - The ID of the user to retrieve
     * @returns The user with the specified ID
     */
    return await this.userModel.findById(id);
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<IUser>{
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

  async deleteUserById(id: string): Promise<IUser>{
    /**
     * Delete a user by their ID
     * @param id - The ID of the user to delete
     */
    return await this.userModel.findByIdAndDelete(id);
  }
}