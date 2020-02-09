import {Body, Controller, Delete, Get, Patch, Post, Request, Route, Tags} from 'tsoa'
import Response from "common/Response";
import qs from 'qs'
import {Request as ExpressRequest} from 'express'
import {ParticipantResponse, Participiant} from "models/Participiant";
import ParticipiantService, {ACCESS_TYPE} from "service/ParticipiantService";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
type Record<K,V> = {[p: K]: V}

@Route()
@Tags('Participants')
export class ParticipantApi extends Controller {

    /**
     * Add new participant
     * @param eventId event id
     * @param id form id
     */
    @Post('/event/{eventId}/forms/{id}')
    public async add(
        id: string,
        @Body() payload: Participiant
    ): Promise<Response<Participiant>> { //TODO: co z tym unknown????
        return await ParticipiantService.add(id, ACCESS_TYPE.PUBLIC, payload)
    }

    /**
     * Edit all participants matching the query
     * @param eventId event id
     * @param id form id
     */
    @Patch('/event/{eventId}/forms/{id}/participants')
    public async editMany(
        id: string,
        @Body() payload: Participiant,
        @Request() {query}: ExpressRequest
    ): Promise<Response<Participiant[]>> {
        return await ParticipiantService.edit(id, qs.parse(query), payload)
    }

    /**
     * Edit one participant
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Patch('/event/{eventId}/forms/{id}/participants/{participantId}')
    public async editOne(
        id: string,
        participantId: string,
        @Body() payload: Participiant
    ): Promise<Response<Participiant>> {
        return await ParticipiantService.editOne(id, participantId, payload)
    }

    /**
     * Get all participants from given form matching given query
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Get('/event/{eventId}/forms/{id}')
    public async find(
        id: string,
        @Request() {query}: ExpressRequest
    ): Promise<Response<ParticipantResponse>> {
        return await ParticipiantService.find(id, qs.parse(query))
    }

    /**
     * Remove participant
     * @param eventId event id
     * @param id form id
     * @param participantId participant id
     */
    @Delete('/event/{eventId}/forms/{id}/participants/{participantId}')
    public async remove(
        id: string,
        participantId: string,
    ): Promise<Response<Participiant>> {
        return await ParticipiantService.remove(id, participantId)
    }

}