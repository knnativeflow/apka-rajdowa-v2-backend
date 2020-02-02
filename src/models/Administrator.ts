import {Document, Schema} from "mongoose";

export enum USER_ROLE {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN'
}

export interface AdministratorChangeRoleRequest {
    role: USER_ROLE;
}

export interface AdministratorRequest {
    email: string;
}

export interface Administrator {
    userId: string;
    role: USER_ROLE;
    email: string;
}

export interface AdministratorDoc extends Administrator, Document{}

export const AdministratorSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [USER_ROLE.OWNER, USER_ROLE.ADMIN]
    },
    email: {
        type: String,
        required: true
    }
})