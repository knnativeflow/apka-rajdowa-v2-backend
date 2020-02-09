import {Document, model, Schema} from "mongoose";

export interface User  extends Document{
    userId: string;
    google: {
        email: string;
        displayName: string;
        photoUrl: string;
    };
}

export const UserSchema = new Schema({
    userId: {type: String, required: true},
    google: {
        email: { type: String, required: true },
        displayName: { type: String, required: true },
        photoUrl: { type: String, required: false }
    }
}, {
    versionKey: false,
    collection: 'users'
})

export const UserModel = model<User>('User', UserSchema)