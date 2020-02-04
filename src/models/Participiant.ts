export type Participiant = Record<string, any>

export interface ParticipantResponse {
    meta: {
        total: number;
        pages: number;
        current_page: number;
    };
    list: Participiant[];
}