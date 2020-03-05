import {Document} from 'mongoose'

export type Participiant = Record<string, any>

export interface ParticipiantDoc extends Document {
    [x: string]: any;
}

export interface ParticipantResponse {
    meta: {
        total: number;
        pages: number;
        current_page: number;
    };
    list: Participiant[];
}