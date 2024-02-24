import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const auth_token = this.extractTokenFromHeader(request);

    if(!auth_token) throw new UnauthorizedException("Supply a Bearer Token");

      // validate the token
      try {
          const payload = this.jwtService.verify(auth_token, {secret: process.env.JWT_SECRET_KEY});
          request.user = payload;
          return true
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