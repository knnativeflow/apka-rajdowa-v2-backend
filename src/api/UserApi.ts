import {Controller, Get, Post, Request, Route, Security, Tags} from 'tsoa'
import Response from "common/Response";
import {Request as ExpressRequest} from 'express'
import UserService from "service/UserService";
import {User} from "models/User";
import { AuthRequest } from 'common/AuthRequest';

@Route()
@Tags('User Api')
export class UserApi extends Controller {

    @Security('GOOGLE_TOKEN')
    @Get('/users/me')
    public async getMe (
        @Request() request: AuthRequest
    ): Promise<Response<User>> { 
        const response = await UserService.getMe(request.user)
        return response
    }
    
    /**
     * Create an account for a new user or return user data if the account already exist
     */
    @Post('/users')
    public async create(
        @Request() request: ExpressRequest
    ): Promise<Response<User>> {
        const token = request.headers['authorization']
        const response = await UserService.verifyAndCreateUser(token)
        return response
    }

}