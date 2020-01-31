import fs from 'fs'
import {EventDoc, EventModel} from 'models/Event'
import Response from 'common/Response'
import { byIdQuery} from 'common/utils'

import UserService from './UserService'

import {logger} from 'common/logger'
import {EventRequest} from "models/EventRequest";
import {User} from "models/User";
import {Administrator, USER_ROLE} from "models/Administrator";
import {Message} from "common/Message";
import Exception from "common/Exception";


const uploadDir = process.env.UPLOAD_DIR || 'public/uploads'

async function add(event: EventRequest, img, user: User): Promise<Response<EventDoc>> {
    logger.info(`Creating new event with name ${event.name} by ${user.google.email}`)
    const {administrators, messages} = await _prepareAdministrators(event.usersEmails, user._id, user.google.email)
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
    const owner: Administrator = {userId: ownerId, role: USER_ROLE.OWNER, email: ownerEmail}
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
    await fs.promises.unlink(`${uploadDir}/${fileName}`)
    logger.info(`Removing file : ${fileName}`)
}

async function update(id: string, event: EventDoc): Promise<Response<EventDoc>> {
    logger.info(`Updating event with id ${id}`)
    const query = byIdQuery(id)
    const result = await EventModel.findOneAndUpdate(query, {$set: event}, {new: true})

    if (result) {
        return new Response(event)
    } else {
        throw Exception.fromMessage(`Event with id ${id} doesn't exist`)
    }
}

async function findAll(user: User): Promise<Response<EventDoc[]>> {
    logger.info(`Fetching all events for ${user.google.email}`)
    const events = await EventModel.find(
        {'administrators.userId': user._id},
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