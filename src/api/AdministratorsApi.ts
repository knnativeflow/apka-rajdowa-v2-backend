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
    @Delete('/events/{eventId}/administrators/{adminId}')
    public async remove(eventId: string, adminId: string, @Request() request: AuthRequest): Promise<Response<EventDoc>> {
        return await AdministratorService.remove(eventId, adminId, request.user)
    }

    /**
     * Change administrator role at given event
     * @param id event id
     * @param adminId admin id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Put('/events/{eventId}/administrators/{adminId}')
    public async changeRole(
        eventId: string,
        adminId: string,
        @Body() payload: AdministratorChangeRoleRequest,
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        return await AdministratorService.changeRole(eventId, adminId, payload.role, request.user)
    }

    /**
     * Create new administrator at given event
     * @param id event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Post('/events/{eventId}/administrators')
    public async add(
        eventId: string,
        @Body() payload: AdministratorRequest,
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        const response = await AdministratorService.add(eventId, payload, request.user)
        this.setStatus(201)
        return response
    }

}