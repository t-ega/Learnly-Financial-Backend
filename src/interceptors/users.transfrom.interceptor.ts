import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    joined: string;
    lastLogin: string;
}

@Injectable()
export class UsersTransformInterceptor<T> implements NestInterceptor<T, Response<T>> {

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({
        _id: data._id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
        joined: data.createdAt,
        lastLogin: data.lastLogin,
      })))
  }
}