import mongoose, {Document, model, Model, Schema} from 'mongoose'
import {TokenPayload} from 'google-auth-library'
import {byIdQuery, isObjectID} from 'common/utils'
import {Changelog, ChangelogDoc, ChangelogSchema} from 'models/Changelog'
import {logger} from 'common/logger'
import Response from 'common/Response'
import {EventModel} from 'models/Event'
import Exception, {isException} from 'common/Exception'

async function methodWithChangelog<T extends Document>(
    model: Model<T>,
    eventId: string,
    user: TokenPayload,
    entityId: string,
    type: CHANGE_TYPE,
    description: string,
    method: () => Promise<Response<T>>
): Promise<Response<T>> {
    try {
        const changelogModel = await _getEventChangelogModel(eventId)
        if (type === CHANGE_TYPE.EDIT) {
            const previous = await model.findOne(byIdQuery(entityId))
            const result = await method()
            const record = new Changelog(user.email, previous, result.data, type, description)
            await changelogModel.create(record)
            return result
        } else if(type === CHANGE_TYPE.ADD) {
            const result = await method()
            const record = new Changelog(user.email, null, result.data, type, description)
            await changelogModel.create(record)
            return result
        } else {
            const previous = await model.findOne(byIdQuery(entityId))
            const result = await method()
            const record = new Changelog(user.email, previous, null, type, description)
            await changelogModel.create(record)
            return result
        }
    } catch (e) {
        if(isException(e)) throw e
        logger.error(`There was error during changelog creation`, e)
        throw Exception.fromMessage(`Wystąpił problem podczas generowania Changeloga, nie mogliśmy zapisać zmian!`)
    }
}

export enum CHANGE_TYPE {
    ADD = 'ADD',
    EDIT = 'EDIT',
    REMOVE = 'REMOVE'
}

async function findAllLogs(eventId: string): Promise<Response<ChangelogDoc[]>> {
    logger.info(`Getting changelog for event ${eventId}`)
    const changelogModel = await _getEventChangelogModel(eventId)
    const result = await changelogModel.find()
    return new Response(result)
}

async function _getEventChangelogModel(eventId: string): Promise<Model<ChangelogDoc>> {
    const eventSlug = await _getEventSlug(eventId)
    const changelogModelName = `changelog_${eventSlug}`
    if (mongoose.modelNames().includes(changelogModelName)) {
        return mongoose.model(changelogModelName)
    }

    const schema = new Schema(ChangelogSchema, {
        versionKey: false,
        collection: changelogModelName
    })
    return model<ChangelogDoc>(
        changelogModelName,
        schema
    )
}

async function _getEventSlug(eventId: string): Promise<string> {
    if (!isObjectID(eventId)) return eventId
    const result = await EventModel.findOne({_id: eventId})
    return result.slug
}

export default {
    findAllLogs,
    methodWithChangelog
}
