import {Body, Controller, Delete, Patch, Post, Route, Tags} from 'tsoa'
import Response from "common/Response";
import {AdministratorChangeRoleRequest, AdministratorDoc, AdministratorRequest} from "models/Administrator";
import AdministratorService from "service/AdministratorService";

@Route()
@Tags('Administrator')
export class AdministratorApi extends Controller {

    /**
     * Remove administrator from given event
     * @param id event id
     * @param adminId admin id
     */
    @Delete('/events/{id}/administrators/{adminId}')
    public async remove(id: string, adminId: string): Promise<Response<AdministratorDoc[]>> {
        return await AdministratorService.remove(id, adminId)
    }

    /**
     * Change administrator role at given event
     * @param id event id
     * @param adminId admin id
     */
    @Patch('/events/{id}/administrators/{adminId}')
    public async changeRole(
        id: string,
        adminId: string,
        @Body() payload: AdministratorChangeRoleRequest
    ): Promise<Response<AdministratorDoc[]>> {
        return await AdministratorService.changeRole(id, adminId, payload.role)
    }

    /**
     * Create new administrator at given event
     * @param id event id
     */
    @Post('/events/{id}/administrators')
    public async add(
        id: string,
        @Body() payload: AdministratorRequest
    ): Promise<Response<AdministratorDoc[]>> {
        return await AdministratorService.add(id, payload)
    }

}