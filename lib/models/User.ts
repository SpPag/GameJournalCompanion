import mongoose, { Schema, Document, model, models } from "mongoose";

// useful to export the interface for strong typing function returns, consistent return types, TypeScript validations and checks and more
interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    createdAt: Date;
    isAdmin: boolean;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        match: /^[a-zA-Z0-9._\-+%]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ // regex note: the '-' character must be escaped, because otherwise it will be treated as an operator that sets a range. An alternative would be to have it at the end of the regex
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

// the following line checks if a model named 'User' has already been registered with Mongoose. If yes, it's saved to the User variable, otherwise, it creates a new model, registers it with Mongoose and saves it to the User variable
const User = models.User || model<IUser>("User", UserSchema);

export type { IUser }
export { User, UserSchema }