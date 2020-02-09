import {Document, Schema} from "mongoose";
import {ROLE} from "common/consts";

export interface AdministratorChangeRoleRequest {
    role: ROLE;
}

export interface AdministratorRequest {
    email: string;
}

export interface Administrator {
    userId: string;
    role: ROLE;
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
        enum: [ROLE.EVENT_OWNER, ROLE.EVENT_ADMINISTRATOR]
    },
    email: {
        type: String,
        required: true
    }
})