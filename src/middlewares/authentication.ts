import * as express from 'express'
import Exception from 'common/Exception'
import UserService from "service/UserService";
import {SECURITY} from "common/consts";

export async function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<any> {
    if (securityName === SECURITY.GOOGLE_TOKEN) {
        const token = request.headers['authorization']
        if (!token)
            throw Exception.fromMessage('Nie podano tokenu!', 401)

        return await UserService.verifyTokenAndFetchUserFromGoogle(token) //TODO: co w sumie potrzebujemy w tym miejscu definiowac
    }
}