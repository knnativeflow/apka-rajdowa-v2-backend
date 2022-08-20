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
import {removeFile, uploadPublicFile} from "common/aws";



async function add(request: EventRequest, logo: Express.Multer.File, user: TokenPayload): Promise<Response<EventDoc>> {
    logger.info(`Creating new event with name ${request.name} by ${user.email}`)
    console.log(request)
    const {administrators, messages} = await _prepareAdministrators(request.usersEmails, user.sub, user.email)
    //TODO: validate if startDate is before endDate
    const parsedEvent = {
        ...request,
        administrators,
        forms: [],
        logo: 'boilerplate'
    }
    const event = await EventModel.create(parsedEvent)

    const logoPath = `img/logo/${event.slug}`
    await uploadPublicFile(logoPath, logo.buffer, logo.mimetype)
    const logoUrl = `https://apka-rajdowa-prod.s3.eu-central-1.amazonaws.com/${logoPath}`
    const result = await EventModel.findOneAndUpdate({_id: event._id}, {logo: logoUrl}, {new: true})

    await mongoose.connection.createCollection(`changelog_${event.slug}`)
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
    const key = result.logo.split('.com/')[1]
    await removeFile(key)
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
            if (!result) throw Exception.fromMessage(`Event with id ${eventId} doesn't exist`, 404)
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
    const result: EventDoc | null = await EventModel.findOne(query).lean()
    if(!result) throw Exception.fromMessage(`Event with id ${id} doesn't exist`, 404)
    return new Response(result)
}

async function findPublicByFormId(formId: string): Promise<Response<EventPublicDoc>> {
    logger.info(`Fetching public event data for ${formId} form`)
    const query = await getEventIdFromFormId(formId)
    const result = await EventModel.findOne(query, 'name startDate endDate logo')

    if(!result) throw Exception.fromMessage(`Event doesn't exist`, 404)

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
