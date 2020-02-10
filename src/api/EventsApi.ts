import {Body, Controller, Delete, Get, Post, Put, Request, Route, Security, Tags} from 'tsoa'
import {EventDoc, EventUpdateRequest} from 'models/Event'
import Response from 'common/Response'
import EventService from 'service/EventService'
import multer from 'multer'
import {AuthRequest, FileAuthRequest} from 'common/AuthRequest'

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
    @Security('GOOGLE_TOKEN', ['ADMIN'])
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
        @Request() request: FileAuthRequest
    ): Promise<Response<EventDoc>> {
        await _handleFile(request)
        return await EventService.add(request.body, request.file, request.user)
    }

    /**
     * Update event
     *  @param eventId event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Put('/events/{eventId}')
    public async update(eventId: string, @Body() event: EventUpdateRequest): Promise<Response<EventDoc>> {
        return await EventService.update(eventId, event)
    }

    /**
     * Remove event
     *  @param eventId event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Delete('/events/{eventId}')
    public async remove(eventId: string): Promise<Response<EventDoc>> {
        return await EventService.remove(eventId)
    }

}

function _handleFile(request: AuthRequest): Promise<any> {
    const multerSingle = multer({dest: 'static/img'}).single('logo')
    return new Promise((resolve, reject) => {
        multerSingle(request, undefined,  error => {
            if (error) {
                reject(error)
            }
            resolve()
        })
    })
}