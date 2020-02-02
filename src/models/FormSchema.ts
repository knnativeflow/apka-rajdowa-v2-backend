import {Document, model, Schema} from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Structure {}

export interface FormSchemaRequest {
    details: {
        name: string;
        description: string;
        colors: {
            primaryColor: string;
            backgroundColor: string;
        };
    };
    schema: Structure;
}


export interface FormSchemaDoc extends Document{
    name: string;
    description: string;
    colors: {
        primary: string;
        background: string;
    };
    structure: Structure;
    slug: string;
}

export const FormSchemaSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        colors: {
            primary: { type: String },
            background: { type: String }
        },
        structure: { type: Object, required: true },
        slug: {
            type: String,
            slug: 'name',
            unique: true
        }
    },
    {
        versionKey: false,
        collection: 'schemas'
    }
)

export const FormSchemaModel = model<FormSchemaDoc>('FormSchema', FormSchemaSchema)
