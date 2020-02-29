import {Body, Controller, Delete, Post, Put, Request, Route, Security, Tags} from 'tsoa'
import Response from 'common/Response'
import {AdministratorChangeRoleRequest, AdministratorRequest} from 'models/Administrator'
import AdministratorService from 'service/AdministratorService'
import {AuthRequest} from 'common/AuthRequest'
import {EventDoc} from 'models/Event'

@Route()
@Tags('Administrators')
export class AdministratorApi extends Controller {

    /**
     * Remove administrator from given event
     * @param id event id
     * @param adminId admin id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Delete('/events/{id}/administrators/{adminId}')
    public async remove(id: string, adminId: string, @Request() request: AuthRequest): Promise<Response<EventDoc>> {
        return await AdministratorService.remove(id, adminId, request.user)
    }

    /**
     * Change administrator role at given event
     * @param id event id
     * @param adminId admin id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Put('/events/{id}/administrators/{adminId}')
    public async changeRole(
        id: string,
        adminId: string,
        @Body() payload: AdministratorChangeRoleRequest,
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        return await AdministratorService.changeRole(id, adminId, payload.role, request.user)
    }

    /**
     * Create new administrator at given event
     * @param id event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Post('/events/{id}/administrators')
    public async add(
        id: string,
        @Body() payload: AdministratorRequest,
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        const response = await AdministratorService.add(id, payload, request.user)
        this.setStatus(201)
        return response
    }

}