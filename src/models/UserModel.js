import mongoose from 'mongoose';

import { USER_ROLE } from '../constants/role.js';

const UserSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: Number, default: USER_ROLE.USER },
    },
    {
        timestamps: true,
        collection: 'User',
    },
);

UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
