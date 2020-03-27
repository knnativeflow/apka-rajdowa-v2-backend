import {Body, Controller, Delete, Get, Patch, Post, Request, Route, Security, Tags} from 'tsoa'
import Response from "common/Response";
import qs from 'qs'
import {Request as ExpressRequest} from 'express'
import {ParticipantResponse, Participiant} from "models/Participiant";
import ParticipiantService, {ACCESS_TYPE} from "service/ParticipiantService";
import {AuthRequest} from 'common/AuthRequest'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
type Record<K,V> = {[p: K]: V}

@Route()
@Tags('Participants')
export class ParticipantApi extends Controller {

    /**
     * Add new participant
     * @param id form id
     */
    @Post('/forms/{id}')
    public async add(
        id: string,
        @Body() payload: Participiant
    ): Promise<Response<Participiant>> {
        const response = await ParticipiantService.add(id, ACCESS_TYPE.PUBLIC, payload)
        this.setStatus(201)
        return response
    }

    /**
     * Edit all participants matching the query
     * @param eventId event id
     * @param id form id
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Patch('/events/{eventId}/forms/{id}/participants')
    public async editMany(
        eventId: string,
        id: string,
        @Body() payload: Participiant,
        @Request() request: AuthRequest
    ): Promise<Response<Participiant[]>> {
        return await ParticipiantService.editMany(id, qs.parse(request.query, { comma: true }), payload, request.user)
    }

    /**
     * Edit one participant
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Patch('/events/{eventId}/forms/{id}/participants/{participantId}')
    public async editOne(
        eventId: string,
        id: string,
        participantId: string,
        @Body() payload: Participiant,
        @Request() request: AuthRequest
    ): Promise<Response<Participiant>> {
        return await ParticipiantService.editOne(id, participantId, payload, request.user)
    }

    /**
     * Get all participants from given form matching given query
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Get('/events/{eventId}/forms/{id}')
    public async find(
        eventId: string,
        id: string,
        @Request() {query}: ExpressRequest
    ): Promise<Response<ParticipantResponse>> {
        return await ParticipiantService.find(id, qs.parse(query, { comma: true }))
    }

    /**
     * Remove participant
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Delete('/events/{eventId}/forms/{id}/participants/{participantId}')
    public async remove(
        eventId: string,
        id: string,
        participantId: string,
        @Request() request: AuthRequest
    ): Promise<Response<Participiant>> {
        return await ParticipiantService.remove(id, participantId, request.user)
    }

    /**
     * Remove all participants matching the query
     * @param eventId event id
     * @param id form id
     */
    @Security('GOOGLE_TOKEN', ['ADMIN'])
    @Delete('/events/{eventId}/forms/{id}/participants')
    public async removeMany(
        eventId: string,
        id: string,
        @Request() request: AuthRequest
    ): Promise<Response<Participiant>> {
        return await ParticipiantService.removeMany(id, qs.parse(request.query, { comma: true }), request.user)
    }

}
