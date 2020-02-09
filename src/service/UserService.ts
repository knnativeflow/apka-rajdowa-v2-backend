import {User, UserModel} from "models/User";
import Response from "common/Response";
import {logger} from "common/logger";
import {TokenPayload} from "google-auth-library/build/src/auth/loginticket";
import {config} from "config/config";
import Exception from "common/Exception";
import {OAuth2Client} from 'google-auth-library'

const client = new OAuth2Client(config.googleClientId)

async function verifyAndCreateUser(token: string): Promise<Response<User | null>> {
    const {name, email, picture} = await verifyTokenAndFetchUserFromGoogle(token)

    const result = await UserModel.findOne({'google.email': email})

    if(result)
        return new Response(null, 200)

    logger.info(`Creating new user with name ${name}`)

    const admin = await UserModel.create({
        google: {
            email,
            displayName: name,
            photoUrl: picture
        }
    })

    return new Response(admin, 201)
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

export default {
    verifyAndCreateUser,
    verifyTokenAndFetchUserFromGoogle
}