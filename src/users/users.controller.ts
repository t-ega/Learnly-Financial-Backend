import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import mongoose from 'mongoose';

// internal imports
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDtoFromEndpoint } from './dto/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/isadmin.guard';
import { IRequestPayload, IUser } from '../types';
import { UsersTransformInterceptor } from 'src/interceptors/users.transfrom.interceptor';

@Controller('users')
export class UsersController {
  /**
   * This class ensures that Users should be able to register,
   *  log in, and access protected resources based on their roles.
   * It achieves role based authentication by using guards.
   * Note: This controller doesnt support operations like update/delete on the users model.
   * 
   * @param usersService User service for the controller.
   */

  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(UsersTransformInterceptor)
  @Post()
  /**
   * Register a new user
   * @param createUserDto - User details for registration
   * @returns The created user
   */
  async register(@Body() createUserDto: CreateUserDto){
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, AdminGuard) // enforce endpoint for only admins
  // transform the response using the interceptor. Remove fields like password, createdAt, updatedAt etc
  @UseInterceptors(UsersTransformInterceptor) 
  @Get()
  /**
   * Retrieve all users
   * @returns All users in the system
   */
  async findAll(){
    return await this.usersService.getUsers();
  }

  @UseGuards(AuthGuard)
  // transform the response using the interceptor. Remove fields like password, createdAt, updatedAt etc
  @UseInterceptors(UsersTransformInterceptor)
  @Get("me")
  /**
   * Retrieve the currently authenticated user
   * @param req - The current request object
   * @returns The authenticated user
   */
  async findUser(@Request() req :IRequestPayload){
    return await this.usersService.getUserById(req.user.id)
  }

  @UseInterceptors(UsersTransformInterceptor)
  @UseGuards(AuthGuard, AdminGuard)
  @Get(":id")
  /**
   * Retrieve a user by ID
   * @param id - The ID of the user to retrieve
   * @throws NotFoundException if the user is not found or the ID is invalid
   * @returns The user with the specified ID
   */
  async getUserById(@Param("id") id: string) : Promise<IUser> {
    
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) throw new NotFoundException("User not found");

    const user = await this.usersService.getUserById(id);

    if(!user) throw new NotFoundException("User not found");

    return user
  }
  
  @UseInterceptors(UsersTransformInterceptor)
  @UseGuards(AuthGuard)
  @Patch(":id")
  /**
   * Update a user by ID
   * @param id - The ID of the user to update
   * @param updateUserDto - Updated user details
   * @throws NotFoundException if the user is not found or the ID is invalid
   * @returns The updated user
   */
  async updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDtoFromEndpoint){
    const isValid = mongoose.isValidObjectId(id);

    if (!isValid) throw new NotFoundException("User not found");

    const updatedUser =  await this.usersService.updateUserById(id, updateUserDto);

    if(!updatedUser) throw new NotFoundException("User not found")

    return updatedUser;
  }

}