import fs from 'fs'
import {EventDoc, EventModel, EventRequest, EventUpdateRequest, EventPublicDoc} from 'models/Event'
import Response from 'common/Response'
import {byIdQuery, getEventIdFromFormId} from 'common/utils'
import UserService from './AdministratorService'
import {logger} from 'common/logger'
import {Administrator} from 'models/Administrator'
import {Message} from 'common/Message'
import Exception from 'common/Exception'
import {ROLE} from 'common/consts'
import {TokenPayload} from 'google-auth-library'
import clog, {CHANGE_TYPE} from 'service/ChangesLogerService'
import mongoose from 'mongoose'
import {FormSchemaModel} from 'models/FormSchema'

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
    await mongoose.connection.createCollection(`changelog_${result.slug}`)
    return new Response(result, messages)
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
    if (!result) throw Exception.fromMessage(`Event with id ${id} doesn't exist`)
    await _removeEventLogo(result)
    await _removeAssociatedCollections(result)
    return new Response(result)
}

async function _removeAssociatedCollections(result: EventDoc): Promise<void> {
    try {
        await FormSchemaModel.deleteMany({slug: result.forms})
        await Promise.all(result.forms.map(slug => _dropCollection(`form_${slug}`)))
        await _dropCollection(`changelog_${result.slug}`)
    } catch {
        logger.error('Error during event clean up')
    }
}

function _dropCollection(name: string): Promise<any> {
   return mongoose.connection.collection(name).drop()
}

async function _removeEventLogo(result: EventDoc): Promise<void> {
    const fileName = result.logo.split('/img/')[1]
    try {
        await fs.promises.unlink(`static/img/${fileName}`)
        logger.info(`Removed file : ${fileName}`)
    } catch (e) {
        logger.error(`Failed during removing file: ${fileName}`)
    }
}

async function update(eventId: string, event: EventUpdateRequest, user: TokenPayload): Promise<Response<EventDoc>> {
    return clog.methodWithSingleChangelog(
        EventModel,
        eventId,
        user,
        eventId,
        CHANGE_TYPE.EDIT,
        'Zmiana ustawień wydarzenia',
        async () => {
            logger.info(`Updating event with id ${eventId}`)
            const query = byIdQuery(eventId)
            const result = await EventModel.findOneAndUpdate(query, {$set: event}, {new: true})
            if (!result) throw Exception.fromMessage(`Event with id ${eventId} doesn't exist`)
            return new Response(result)
        })
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

async function findPublicByFormId(formId: string): Promise<Response<EventPublicDoc>> {
    logger.info(`Fetching public event data for ${formId} form`)
    const query = await getEventIdFromFormId(formId)
    const result = await EventModel.findOne(query, 'name startDate endDate logo')
    return new Response(result)
}

export default {
    add,
    remove,
    update,
    findAll,
    findById,
    findPublicByFormId,
}
