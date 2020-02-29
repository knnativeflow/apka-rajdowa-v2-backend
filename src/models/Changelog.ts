import {Document, model, Schema} from 'mongoose'
import {CHANGE_TYPE} from 'service/ChangesLogerService'
import {config} from 'config/config'

export class Changelog {
    constructor(
        readonly user: string, //TODO: rozszerzyc typ
        readonly previousState: any,
        readonly actualState: any,
        readonly changeType: CHANGE_TYPE,
        readonly description: string,
        readonly createdAt: string = Date().toString()
    ) {
    }
}

export interface ChangelogDoc extends Document {
    createdAt: string;
    user: string; //TODO: rozszerzyc typ
    previousState: any;
    actualState: any;
    changeType: CHANGE_TYPE;
    description: string;
}

export const ChangelogSchema = new Schema(
    {
        createdAt: {
            type: Date,
            required: true,
            expires: config.changelogExpireTime
        },
        user: {
            type: String,
            required: true
        },
        previousState: {
            type: Object,
            required: true
        },
        actualState: {
            type: Object,
            required: true
        },
        changeType: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false,
        collection: 'changelog'
    }
)
