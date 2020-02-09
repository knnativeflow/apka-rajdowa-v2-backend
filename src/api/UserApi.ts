import {Controller, Post, Request, Route, Tags} from 'tsoa'
import Response from "common/Response";
import {Request as ExpressRequest} from 'express'
import UserService from "service/UserService";
import {User} from "models/User";


@Route()
@Tags('User Api')
export class UserApi extends Controller {

    /**
     * Create new schema
     * @param id event id
     */
    @Post('/users')
    public async create(
        @Request() request: ExpressRequest
    ): Promise<Response<User>> {
        const token = request.headers['authorization']
        return await UserService.verifyAndCreateUser(token)
    }

}