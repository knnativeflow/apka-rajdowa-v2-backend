import {Controller, Post, Request, Route, Tags} from 'tsoa'
import Response from "common/Response";
import {Request as ExpressRequest} from 'express'
import UserService from "service/UserService";
import {User} from "models/User";


@Route()
@Tags('User Api')
export class UserApi extends Controller {

    /**
     * Create an account for a new user or return user data if the account already exist
     */
    @Post('/users')
    public async create(
        @Request() request: ExpressRequest
    ): Promise<Response<User>> {
        const token = request.headers['authorization']
        const response = await UserService.verifyAndCreateUser(token)
        if(response.data) this.setStatus(201)
        return response
    }

}