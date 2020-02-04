export interface Query {
    page: string;
    count: string;
    sort: Record<string, string>;
    fields: Record<string, string>;
    filters: Record<string, string[]>;
}