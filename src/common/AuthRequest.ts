import { Request as ExpressRequest } from 'express'

export interface AuthRequest extends ExpressRequest {
    user: any;
}

export interface FileAuthRequest extends AuthRequest{
    file: any;
}