import {Document, Model} from 'mongoose'
import {TokenPayload} from 'google-auth-library'
import {byIdQuery} from 'common/utils'
import {Changelog, ChangelogDoc, ChangelogModel} from 'models/Changelog'
import {logger} from 'common/logger'
import Response from 'common/Response'

export enum CHANGE_TYPE {
    ADD = 'ADD',
    EDIT = 'EDIT',
    REMOVE = 'REMOVE'
}

async function logChange<T extends Document>(model: Model<T>, eventId: string, type: CHANGE_TYPE, entityId: string, change: any, user: TokenPayload): Promise<void> {
    try {
        if (type != CHANGE_TYPE.ADD) {
            const previous = await model.findOne(byIdQuery(entityId))
            if (!previous) throw {}

            const record = new Changelog(user.email, previous, change, type)
            await ChangelogModel.create(record)
        } else {
            const record = new Changelog(user.email, null, change, type)
            await ChangelogModel.create(record)
        }
    } catch (err) {
        logger.error(`There was error during changelog creation`, err)
    }
}

async function findAllLogs(eventId: string): Promise<Response<ChangelogDoc[]>> {
    logger.info(`Getting changelog for event ${eventId}`)
    const result = await ChangelogModel.find()
    return new Response(result)
}

export default {
    logChange,
    findAllLogs
}
