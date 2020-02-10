import fs from 'fs'
import {EventDoc, EventModel, EventRequest, EventUpdateRequest} from 'models/Event'
import Response from 'common/Response'
import {byIdQuery} from 'common/utils'

import UserService from './AdministratorService'

import {logger} from 'common/logger'
import {Administrator} from 'models/Administrator'
import {Message} from 'common/Message'
import Exception from 'common/Exception'
import {ROLE} from 'common/consts'
import {TokenPayload} from 'google-auth-library'

async function add(event: EventRequest, img, user: TokenPayload): Promise<Response<EventDoc>> {
    logger.info(`Creating new event with name ${event.name} by ${user.email}`)
    console.log(event)
    const {administrators, messages} = await _prepareAdministrators([], user.sub, user.email) //TODO replace this empty array
    const parsedEvent = {
        ...event,
        administrators,
        forms: [],
        logo: `/static/img/${img.filename}`
    }
    const result = await EventModel.create(parsedEvent)

    return new Response(result, 201, messages)
}

async function _prepareAdministrators(
    emails: string[],
    ownerId: string,
    ownerEmail: string
): Promise<{ administrators: Administrator[]; messages: Message[] }> {
    const messages: Message[] = []
    const owner: Administrator = {userId: ownerId, role: ROLE.EVENT_OWNER, email: ownerEmail}
    const administrators = await UserService.parseEmailsToUsers(emails, messages)
    return {administrators: [owner, ...administrators], messages}
}

async function remove(id: string): Promise<Response<EventDoc>> {
    logger.info(`Deleting event : ${id}`)
    const query = byIdQuery(id)
    const result = await EventModel.findOneAndDelete(query)

    if (result) {
        await _removeEventLogo(result)
        return new Response(result)
    } else {
        throw Exception.fromMessage(`Event with id ${id} doesn't exist`)
    }
}

async function _removeEventLogo(result: EventDoc): Promise<void> {
    const fileName = result.logo.split('/img/')[1]
    await fs.promises.unlink(`static/img/${fileName}`)
    logger.info(`Removing file : ${fileName}`)
}

async function update(id: string, event: EventUpdateRequest): Promise<Response<EventDoc>> {
    logger.info(`Updating event with id ${id}`)
    const query = byIdQuery(id)
    const result = await EventModel.findOneAndUpdate(query, {$set: event}, {new: true})

    if (result) {
        return new Response(result)
    } else {
        throw Exception.fromMessage(`Event with id ${id} doesn't exist`)
    }
}

async function findAll(user: TokenPayload): Promise<Response<EventDoc[]>> {
    logger.info(`Fetching all events for ${user.email}`)
    const events = await EventModel.find(
        {'administrators.userId': user.sub},
        {
            _id: false,
            forms: false,
            administrators: false,
            emailAlias: false
        }
    )

    return new Response(events)
}

async function findById(id: string): Promise<Response<EventDoc>> {
    logger.info(`Fetching event ${id} details`)
    const query = byIdQuery(id)
    const result = await EventModel.findOne(query)

    return new Response(result)
}

export default {
    add,
    remove,
    update,
    findAll,
    findById
}