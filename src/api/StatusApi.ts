import {Controller, Get, Post, Request, Route, Tags} from 'tsoa'
import Response from "common/Response";
import {Request as ExpressRequest} from 'express'


@Route()
@Tags('Status Api')
export class StatusApi extends Controller {

    /**
     * Check app status
     */
    @Get('/status')
    public async status(
        @Request() request: ExpressRequest
    ): Promise<Response<string>> {
        return new Response('Hello!')
    }

}