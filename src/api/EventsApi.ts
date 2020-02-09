import {Body, Controller, Delete, Get, Post, Put, Request, Route, Security, Tags} from 'tsoa'
import {EventDoc} from 'models/Event'
import Response from 'common/Response'
import EventService from 'service/EventService'
import {UserModel} from 'models/User'
import {ROLE} from 'common/consts'
import multer from 'multer'
import AuthRequest from 'common/AuthRequest'

const MOCK_USER = new UserModel({
    google: {
        email: 'string',
        googleId: 'string',
        displayName: 'string',
        photoUrl: 'string',
        gender: 'string'
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
    public async findAll(@Request() request: AuthRequest): Promise<Response<EventDoc[]>> {
        return await EventService.findAll(request.user)
    }

    /**
     * Find specific event by given id
     *  @param eventId event id
     */
    @Security('GOOGLE_TOKEN', [ROLE.EVENT_ADMINISTRATOR])
    @Get('/events/{eventId}')
    public async findById(eventId: string): Promise<Response<EventDoc>> {
        return await EventService.findById(eventId)
    }

    /**
     * Create event
     */
    @Security('GOOGLE_TOKEN')
    @Post('/events')
    public async create(
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        await _handleFile(request)
        return await EventService.add(request.body, request.file, request.user)
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

function _handleFile(request: AuthRequest): Promise<any> {
    const multerSingle = multer({dest: 'static/img'}).single('logo')
    return new Promise((resolve, reject) => {
        multerSingle(request, undefined, async error => {
            if (error) {
                reject(error)
            }
            resolve()
        })
    })
}