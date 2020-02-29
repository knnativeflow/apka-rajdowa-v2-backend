import {Document, model, Schema} from 'mongoose'
import {CHANGE_TYPE} from 'service/ChangesLogerService'
import {config} from 'config/config'

export class Changelog {
    constructor(
        private readonly user: string, //TODO: rozszerzyc typ
        private readonly previousState: any,
        private readonly actualState: any,
        private readonly changeType: CHANGE_TYPE,
        private readonly createdAt: string = Date().toString()
    ) {
    }
}

export interface ChangelogDoc extends Document {
    createdAt: string;
    user: string; //TODO: rozszerzyc typ
    previousState: any;
    actualState: any;
    changeType: CHANGE_TYPE;
    // changeSubject: string; //TODO: co i jak?
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
        }
    },
    {
        versionKey: false,
        collection: 'changelog'
    }
)

export const ChangelogModel = model<ChangelogDoc>('ChangelogDoc', ChangelogSchema)
