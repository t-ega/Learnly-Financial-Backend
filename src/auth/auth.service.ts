import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { now } from 'mongoose';
import { Response } from 'express';

import { UsersService } from '../users/users.service';
import { Ipayload, UserRoles } from '../types';

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
         * @satisfies { IPAYLOAD } | Every `payload` issued must be a type of IPAYLOAD.
         * @see IPAYLOAD in the types files for more details on the structure of this object.
         * @throws HttpException for invalid login attempts.
         */

        const user = await this.userService.getUserByEmail(email);

        if (!user) throw new HttpException("Email or password incorrect", HttpStatus.BAD_REQUEST);

        const isValid = await bcrypt.compare(password, user.password);

        if(!isValid) throw new HttpException(`Email or password incorrect.`, HttpStatus.BAD_REQUEST);

        // construct the payload which is going to be used to verify the user during subsequent requests

        // every JWTPAYLOAD must use the IPAYLOAD interface for annotations
        const jwtPayload : Ipayload  = {id: user.id, role: UserRoles.REGULAR}
        
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
