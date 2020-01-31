import {Document, model, Schema} from "mongoose";

export interface User  extends Document{
    google: {
        email: string;
        googleId: string;
        displayName: string;
        photoUrl: string;
        gender: string;
    };
}

export const UserSchema = new Schema({
    google: {
        email: { type: String, required: true },
        googleId: { type: String, required: true },
        displayName: { type: String, required: true },
        photoUrl: { type: String, required: false },
        gender: { type: String, required: false }
    }
}, {
    versionKey: false,
    collection: 'users'
})

export const UserModel = model<User>('User', UserSchema)