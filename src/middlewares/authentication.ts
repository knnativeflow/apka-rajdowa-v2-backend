import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import Exception from 'common/Exception'
import {OAuth2Client} from 'google-auth-library'
import {TokenPayload} from 'google-auth-library/build/src/auth/loginticket'
import {config} from 'config/config'

const client = new OAuth2Client(config.googleClientId)

export async function verifyTokenAndFetchUserFromGoogle(token: string): Promise<TokenPayload> {
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

export async function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
    if (securityName === 'jwt') {
        const token = request.headers['authorization']
        if (!token)
            throw Exception.fromMessage('Nie podano tokenu!', 401)

        return await verifyTokenAndFetchUserFromGoogle(token) //TODO: co w sumie potrzebujemy w tym miejscu definiowac
    }
}