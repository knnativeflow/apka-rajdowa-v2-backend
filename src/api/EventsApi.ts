import {Body, Controller, Delete, Get, Post, Put, Route, Tags} from 'tsoa'
import {EventDoc} from "models/Event"
import Response from "common/Response";
import EventService from "service/EventService";
import {UserModel} from "models/User";
import {EventRequest} from "models/EventRequest";

const MOCK_USER = new UserModel({
    google: {
        email: 'string',
        googleId: 'string',
        displayName: 'string',
        photoUrl: 'string',
        gender: 'string',
    }
})

interface Document {
    _id: string;
}

@Route()
@Tags('Events')
export class EventsApi extends Controller {

    /**
     * Find all events
     */
    @Get('/events')
    public async findAll(): Promise<Response<EventDoc[]>> {
        return await EventService.findAll(MOCK_USER)
    }

    /**
     * Find specific event by given id
     *  @param id event id
     */
    @Get('/events/{id}')
    public async findById(id: string): Promise<Response<EventDoc>> {
        return await EventService.findById(id)
    }

    /**
     * Create event
     */
    @Post('/events')
    public async create(@Body() event: EventRequest): Promise<Response<EventDoc>> {
        return await EventService.add(event, null, MOCK_USER)
    }

    /**
     * Update event
     *  @param id event id
     */
    @Put('/events/{id}')
    public async update(id: string, @Body() event: EventDoc): Promise<Response<EventDoc>> {
        return await EventService.update(id, event)
    }

    /**
     * Remove event
     *  @param id event id
     */
    @Delete('/events/{id}')
    public async remove(id: string): Promise<Response<EventDoc>> {
        return await EventService.remove(id)
    }

}