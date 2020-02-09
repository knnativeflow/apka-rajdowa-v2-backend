import {UserModel} from "models/User";
import {Administrator, AdministratorDoc, AdministratorRequest} from "models/Administrator";
import {Message} from "common/Message";
import {logger} from "common/logger";
import {EventModel} from "models/Event";
import {byIdQuery} from "common/utils";
import Response from "common/Response";
import Exception from "common/Exception";
import {ROLE} from "common/consts";

async function remove(eventId: string, adminId: string): Promise<Response<AdministratorDoc[]>> {
    logger.info(`Removing admin : ${adminId} from event: ${eventId}`)
    const result = await EventModel.findOneAndUpdate(
        byIdQuery(eventId),
        { $pull: { administrators: { userId: adminId } } },
        { new: true }
    )

    if (result) {
        return new Response(result.administrators)
    } else {
        throw Exception.fromMessage(`Admin with id: ${adminId} doesn't exist`)
    }
}

async function changeRole(eventId: string, adminId: string, newRole: ROLE): Promise<Response<AdministratorDoc[]>> {
    logger.info(`Changing admin : ${adminId} role to ${newRole}`)
    const result = await EventModel.findOneAndUpdate(
        byIdQuery(eventId),
        { $set: { 'administrators.$[element].role': newRole } },
        { arrayFilters: [{ 'element.userId': { $eq: adminId } }], new: true } as any
    )

    if (result) {
        return new Response(result.administrators)
    } else {
        throw Exception.fromMessage(`Admin with id: ${adminId} doesn't exist`)
    }
}

async function add(eventId: string, payload: AdministratorRequest): Promise<Response<AdministratorDoc[]>> {
    logger.info(`Creating new admin ${payload.email} for event : ${eventId}`)
    const messages = []
    const [user] = await parseEmailsToUsers([payload.email], messages)
    const result = await EventModel.findOneAndUpdate(
        byIdQuery(eventId),
        { $push: { administrators: user } },
        { new: true }
    )

    if (result) {
        return new Response(result.administrators, 201, messages)
    } else {
        throw  Exception.fromMessage(`Error during creating new admin for event: ${eventId}`)
    }
}

async function parseEmailsToUsers(emails: string[], messages: Message[]): Promise<Administrator[]> {
    return Promise.all(
        emails.map(async email => {
            const result = await UserModel.findOne({ 'google.email': email })
            if (result) {
                return { userId: result.userId, role: ROLE.EVENT_ADMINISTRATOR, email }

            } else {
                messages.push(Message.error(`Użytkownik ${email} będzie miał dostęp do wydarzenia po pierwszym logowaniu. Nie mamy go jeszcze w systemie.`))
                // This email will be replace by user id after user first login
                return { userId: email, role: ROLE.EVENT_ADMINISTRATOR, email }
            }
        })
    )
}

export default  {
    parseEmailsToUsers,
    remove,
    changeRole,
    add
}
