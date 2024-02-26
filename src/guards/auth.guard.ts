import { Request } from 'express';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { IRequestPayload, Ipayload } from "../types";
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService, private readonly userService : UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
    
  }

  private async validateRequest(request : IRequestPayload ){
    const auth_token = this.extractTokenFromHeader(request);
    if(!auth_token) throw new UnauthorizedException("Supply a Bearer Token");

      // validate the token
      try {
          const payload  = this.jwtService.verify<Ipayload>(auth_token, {secret: process.env.JWT_SECRET_KEY});
          request.user = payload;

          // check if the user is allowed to login and perform actions
          const user = await this.userService.getUserById(payload.id);
          return true;
        }
        catch(err){
          throw new UnauthorizedException("Invalid Token");
      }
      
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}