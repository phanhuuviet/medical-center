import mongoose from 'mongoose';

import { GENDER_ENUM } from '../constants/index.js';
import { USER_ROLE } from '../constants/role.js';

const UserSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: Number, required: true, default: GENDER_ENUM.MALE },
        province: { type: String, required: true },
        district: { type: String, required: true },
        address: { type: String },
        avatar: { type: String },
        phoneNumber: { type: String },
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
