import {Document, model, Schema} from 'mongoose'
import {AdministratorDoc, AdministratorSchema} from "models/Administrator";

export interface EventDoc extends Document{
    administrators: AdministratorDoc[];
    forms: string[];
    name: string;
    emailAlias: string;
    startDate: string;
    endDate: string;
    logo: string;
    slug: string;
}

const EventSchema = new Schema(
    {
        administrators: [AdministratorSchema],
        forms: Array,
        name: {
            type: String,
            required: true
        },
        emailAlias: {
            type: String,
            required: true,
            unique: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true
        }
    },
    {
        versionKey: false,
        collection: 'events'
    }
)

export const EventModel = model<EventDoc>('EventDoc', EventSchema)
