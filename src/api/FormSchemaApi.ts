import {Body, Controller, Get, Post, Route, Security, Tags} from 'tsoa'
import Response from "common/Response";
import FormSchemaService from 'service/FormSchemaService'
import {FormSchemaDoc, FormSchemaRequest} from "models/FormSchema";

@Route()
@Tags('Form Schemas')
export class FormSchemaApi extends Controller {

    /**
     * Create new schema
     * @param eventId event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Post('/events/{eventId}/schema')
    public async create(
        eventId: string,
        @Body() payload: FormSchemaRequest
    ): Promise<Response<FormSchemaDoc>> {
        const response = await FormSchemaService.create(payload, eventId)
        this.setStatus(201)
        return response
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
    @Security('GOOGLE_TOKEN')
    @Get('/schemas/{id}/private') //TODO: to musi być eventId w adresie
    public async getPrivate(id: string): Promise<Response<FormSchemaDoc>> {
        return await FormSchemaService.getPrivate(id)
    }

}
