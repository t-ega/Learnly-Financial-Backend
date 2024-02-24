import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRoles } from 'src/types';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { now } from 'mongoose';
import { Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService, 
        private jwtService: JwtService,
    ){}


    async login(email: string, password: string): Promise<{ x_auth_token: string }>{
        /**
         * This service is called everytime a user logs in.
         * After a successful login an object is sent back to the user which contains 
         * their auth_token and other details.
         * @see ISignInResponse for more details on the structure of this object.
         * @throws HttpException for invalid login attempts.
         */
        const user = await this.userService.getUserByEmail(email);

        if (!user) throw new HttpException("Email or password incorrect", HttpStatus.BAD_REQUEST);

        const isValid = await bcrypt.compare(password, user.password);

        if(!isValid) throw new HttpException(`Email or password incorrect.`, HttpStatus.BAD_REQUEST);

        // construct the payload which is going to be used to verify the user during subsequent requests
        const jwtPayload  = {id: user.id, role: UserRoles.REGULAR}
        const x_auth_token =  await this.jwtService.signAsync(jwtPayload);

        // update the user's last sign up date
        await this.userService.updateUserById(user.id, { lastLogin: now() });

        return {x_auth_token};
       
    }

    async logout(response: Response): Promise<void> {
        response.removeHeader("authorization");
        return;
    }
    
}
