import { Request as ExpressRequest } from 'express'
import { TokenPayload } from 'google-auth-library';

export interface AuthRequest extends ExpressRequest {
    user: TokenPayload;
}

export interface FileAuthRequest extends AuthRequest{
    file: any;
}