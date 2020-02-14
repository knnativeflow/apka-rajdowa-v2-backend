import {User, UserModel} from 'models/User'
import Response from 'common/Response'
import {logger} from 'common/logger'
import {TokenPayload} from 'google-auth-library/build/src/auth/loginticket'
import {config} from 'config/config'
import Exception from 'common/Exception'
import {OAuth2Client} from 'google-auth-library'
import {EventModel} from 'models/Event'
import {byIdQuery} from 'common/utils'
import {ROLE} from 'common/consts'
import {AdministratorDoc} from 'models/Administrator'

const client = new OAuth2Client(config.googleClientId)

async function verifyAndCreateUser(token: string): Promise<Response<User | null>> {
    const {name, email, picture, sub} = await verifyTokenAndFetchUserFromGoogle(token)

    const result = await UserModel.findOne({'google.email': email})

    if(result)
        return new Response(null)

    logger.info(`Creating new user with name ${name}`)

    const admin = await UserModel.create({
        userId: sub,
        google: {
            email,
            displayName: name,
            photoUrl: picture
        }
    })

    return new Response(admin)
}

async function verifyTokenAndFetchUserFromGoogle(token: string): Promise<TokenPayload> {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: config.googleClientId
        })
        return ticket.getPayload()
    } catch {
        throw Exception.fromMessage('Wystąpił problem z weryfikacją Twojego tokenu!', 401)
    }
}

async function verifyAccessToEvent(eventId: string, userId: string, role: ROLE): Promise<boolean> {
    const event = await EventModel.findOne(byIdQuery(eventId))
    if(!event)
        throw Exception.fromMessage(`Nie ma wydarzenia o podanym id: ${eventId}`)

    return event.administrators.some(
        (admin: AdministratorDoc) => admin.userId === userId && _hasAccess(role, admin.role)
    )
}

function _hasAccess(requiredRole: ROLE, userRole: ROLE): boolean {
    return requiredRole === userRole || (requiredRole === ROLE.EVENT_ADMINISTRATOR && userRole === ROLE.EVENT_OWNER)
}

export default {
    verifyAndCreateUser,
    verifyTokenAndFetchUserFromGoogle,
    verifyAccessToEvent
}