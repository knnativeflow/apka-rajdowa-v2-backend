import {Body, Controller, Get, Post, Route, Tags} from 'tsoa'
import Response from "common/Response";
import FormSchemaService from 'service/FormSchemaService'
import {FormSchemaDoc, FormSchemaRequest} from "models/FormSchema";

@Route()
@Tags('Form Schemas')
export class FormSchemaApi extends Controller {

    /**
     * Create new schema
     * @param id event id
     */
    @Post('/events/{id}/schema')
    public async create(
        id: string,
        @Body() payload: FormSchemaRequest
    ): Promise<Response<FormSchemaDoc>> {
        return await FormSchemaService.create(payload, id)
    }

    /**
     * Get public schema
     * @param id schema id
     */
    @Get('/schemas/{id}/public')
    public async getPublic(id: string): Promise<Response<FormSchemaDoc>> {
        return await FormSchemaService.getPublic(id)
    }

    /**
     * Get private schema
     * @param id schema id
     */
    @Get('/schemas/{id}/private')
    public async getPrivate(id: string): Promise<Response<FormSchemaDoc>> {
        return await FormSchemaService.getPrivate(id)
    }

}