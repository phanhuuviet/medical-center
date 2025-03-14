import mongoose from 'mongoose';

import { ACTIVE_STATUS } from '../constants/index.js';

const ClinicSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        hotline: { type: String, required: true },
        address: { type: String, required: true },
        status: { type: Number, default: ACTIVE_STATUS.ACTIVE },
        description: { type: String },
        logo: { type: String, default: null },
    },
    {
        timestamps: true,
        collection: 'Clinic',
    },
);

const ClinicModel = mongoose.model('Clinic', ClinicSchema);
export default ClinicModel;
