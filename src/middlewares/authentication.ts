import * as express from 'express'
import Exception from 'common/Exception'
import UserService from 'service/UserService'
import {ROLE} from 'common/consts'

export async function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
    if (securityName === 'GOOGLE_TOKEN') {
        const token = request.headers['authorization']
        if (!token)
            throw Exception.fromMessage('Nie podano tokenu!', 401)

        const user = await UserService.verifyTokenAndFetchUserFromGoogle(token) //TODO: co w sumie potrzebujemy w tym miejscu definiowac

        if(scopes?.length > 0) {
            const eventId = request.params['eventId']
            const hasAccess = await UserService.verifyAccessToEvent(eventId, user.sub, scopes[0] as ROLE)
            if(!hasAccess)
                throw Exception.fromMessage(`Nie masz wymaganych uprawnień do wydarzenia: ${eventId}`)
        }

        return user
    }
}