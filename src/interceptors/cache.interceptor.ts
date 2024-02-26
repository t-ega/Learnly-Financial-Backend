import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const headers = context.switchToHttp().getRequest().headers;
        const idempotencyKey = headers.idempotencyKey || headers['idempotency-key'];
        
        const isCached = await this.cacheManager.get(idempotencyKey);

        if (isCached) {
            return of(isCached);
        }

        return next.handle();
    }
}