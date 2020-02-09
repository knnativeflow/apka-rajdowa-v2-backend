import {Body, Controller, Delete, Get, Post, Put, Route, Tags, Security} from 'tsoa'
import {EventDoc, EventRequest} from "models/Event"
import Response from "common/Response";
import EventService from "service/EventService";
import {UserModel} from "models/User";

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
    @Security('GOOGLE_TOKEN')
    @Get('/events')
    public async findAll(): Promise<Response<EventDoc[]>> {
        return await EventService.findAll(MOCK_USER)
    }

    /**
     * Find specific event by given id
     *  @param eventId event id
     */
    @Get('/events/{eventId}')
    public async findById(eventId: string): Promise<Response<EventDoc>> {
        return await EventService.findById(eventId)
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
     *  @param eventId event id
     */
    @Put('/events/{eventId}')
    public async update(eventId: string, @Body() event: EventDoc): Promise<Response<EventDoc>> {
        return await EventService.update(eventId, event)
    }

    /**
     * Remove event
     *  @param eventId event id
     */
    @Delete('/events/{eventId}')
    public async remove(eventId: string): Promise<Response<EventDoc>> {
        return await EventService.remove(eventId)
    }

}