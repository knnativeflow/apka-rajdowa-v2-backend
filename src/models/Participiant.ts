import {Document} from 'mongoose'

export type Participiant = Record<string, any>

export type ParticipiantDoc = Document

export interface ParticipantResponse {
    meta: {
        total: number;
        pages: number;
        current_page: number;
    };
    list: Participiant[];
}