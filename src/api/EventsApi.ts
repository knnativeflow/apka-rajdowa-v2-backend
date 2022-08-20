import {Body, Controller, Delete, Get, Post, Put, Request, Route, Security, Tags} from 'tsoa'
import {EventDoc, EventUpdateRequest} from 'models/Event'
import Response from 'common/Response'
import EventService from 'service/EventService'
import multer from 'multer';

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
        const response = await EventService.add(request.body, request.file, request.user)
        this.setStatus(201)
        return response
    }

    /**
     * Update event
     *  @param eventId event id
     */
    @Security('GOOGLE_TOKEN', ['OWNER'])
    @Put('/events/{eventId}')
    public async update(
        eventId: string,
        @Body() event: EventUpdateRequest,
        @Request() request: AuthRequest
    ): Promise<Response<EventDoc>> {
        return await EventService.update(eventId, event, request.user)
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
    const storage = multer.memoryStorage()
    const upload = multer({storage: storage}).single('logo')
    return new Promise<void>((resolve, reject) => {
        upload(request, undefined, error => {
            if (error) {
                reject(error)
            }
            resolve()
        })
    })
}
