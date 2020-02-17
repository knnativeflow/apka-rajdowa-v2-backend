import mongoose, {Document, model, Model, Schema} from 'mongoose'
import {TokenPayload} from 'google-auth-library'
import {byIdQuery, isObjectID} from 'common/utils'
import {Changelog, ChangelogDoc, ChangelogSchema} from 'models/Changelog'
import {logger} from 'common/logger'
import Response from 'common/Response'
import {EventModel} from 'models/Event'

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

async function logChange<T extends Document>(model: Model<T>, eventId: string, type: CHANGE_TYPE, entityId: string, change: any, user: TokenPayload): Promise<void> {
    try {
        const changelogModel = await _getEventChangelogModel(eventId)
        if (type != CHANGE_TYPE.ADD) {
            const previous = await model.findOne(byIdQuery(entityId))
            if (!previous) throw {}
            const record = new Changelog(user.email, previous, change, type)
            await changelogModel.create(record)
        } else {
            const record = new Changelog(user.email, null, change, type)
            await changelogModel.create(record)
        }
    } catch (err) {
        logger.error(`There was error during changelog creation`, err)
    }
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
    logChange,
    findAllLogs
}
