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
        role: { type: Number, default: USER_ROLE.USER, enum: Object.values(USER_ROLE) },
    },
    {
        discriminatorKey: 'role',
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

const DoctorSchema = new mongoose.Schema({
    medicalServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalService', default: null },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null },
    specialty: { type: String, required: true },
    qualification: { type: String, required: true },
    description: { type: String },
});

export const DoctorModel = UserModel.discriminator(USER_ROLE.DOCTOR, DoctorSchema);

export default UserModel;
