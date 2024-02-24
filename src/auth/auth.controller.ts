import { Body, Controller, Post, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';


@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}

    
    @Post("login")
    async signIn(@Body() signInDto: LoginDto, @Res() res: Response) : Promise<void>{
        const details = await this.authService.login(signInDto.email, signInDto.password);
        res.setHeader("authorization", `Bearer ${details.x_auth_token}`);
        res.status(200).json({success: true })
    }

    @Post("logout")
    async signOut(@Res() res: Response) : Promise<void> {
        return await this.authService.logout(res);
    }
}
