import {UserModel} from 'models/User'
import {Administrator, AdministratorDoc, AdministratorRequest} from 'models/Administrator'
import {Message} from 'common/Message'
import {logger} from 'common/logger'
import {EventDoc, EventModel} from 'models/Event'
import {byIdQuery} from 'common/utils'
import Response from 'common/Response'
import Exception from 'common/Exception'
import {ROLE} from 'common/consts'
import clog, {CHANGE_TYPE} from 'service/ChangesLogerService'
import {TokenPayload} from 'google-auth-library'

async function remove(eventId: string, adminId: string, user: TokenPayload): Promise<Response<EventDoc>> {
    return clog.methodWithSingleChangelog(
        EventModel,
        eventId,
        user,
        eventId,
        CHANGE_TYPE.EDIT,
        'Usunięcie Administratora',
        async () => {
            logger.info(`Removing admin : ${adminId} from event: ${eventId}`)
            const result = await EventModel.findOneAndUpdate(
                byIdQuery(eventId),
                {$pull: {administrators: {userId: adminId}}},
                {new: true}
            )
            if (!result) throw Exception.fromMessage(`Admin with id: ${adminId} doesn't exist`)
            return new Response(result)
        })
}

async function changeRole(eventId: string, adminId: string, newRole: ROLE, user: TokenPayload): Promise<Response<EventDoc>> {
    return clog.methodWithSingleChangelog(
        EventModel,
        eventId,
        user,
        eventId,
        CHANGE_TYPE.EDIT,
        'Zmiana roli administratora',
        async () => {
            logger.info(`Changing admin : ${adminId} role to ${newRole}`)
            const result = await EventModel.findOneAndUpdate(
                byIdQuery(eventId),
                {$set: {'administrators.$[element].role': newRole}},
                {arrayFilters: [{'element.userId': {$eq: adminId}}], new: true} as any
            )
            if (!result) throw Exception.fromMessage(`Admin with id: ${adminId} doesn't exist`)
            return new Response(result)
        })
}

async function add(eventId: string, payload: AdministratorRequest, user: TokenPayload): Promise<Response<EventDoc>> {
    return clog.methodWithSingleChangelog(
        EventModel,
        eventId,
        user,
        eventId,
        CHANGE_TYPE.EDIT,
        'Dodanie administratora',
        async () => {
            logger.info(`Creating new admin ${payload.email} for event : ${eventId}`)
            const messages = []
            const [admin] = await parseEmailsToUsers([payload.email], messages)
            const result = await EventModel.findOneAndUpdate(
                byIdQuery(eventId),
                {$push: {administrators: admin}},
                {new: true}
            )
            if (!result) throw Exception.fromMessage(`Error during creating new admin for event: ${eventId}`)
            return new Response(result, messages)
        })
}

async function parseEmailsToUsers(emails: string[], messages: Message[]): Promise<Administrator[]> {
    return Promise.all(
        emails.map(async email => {
            const result = await UserModel.findOne({'google.email': email})
            if (result) {
                return {userId: result.userId, role: ROLE.EVENT_ADMINISTRATOR, email}

            } else {
                messages.push(Message.error(`Użytkownik ${email} będzie miał dostęp do wydarzenia po pierwszym logowaniu. Nie mamy go jeszcze w systemie.`))
                // This email will be replace by user id after user first login
                return {userId: email, role: ROLE.EVENT_ADMINISTRATOR, email}
            }
        })
    )
}

export default {
    parseEmailsToUsers,
    remove,
    changeRole,
    add
}
