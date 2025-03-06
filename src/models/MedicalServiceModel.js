import mongoose from 'mongoose';

import { MEDICAL_SERVICE_TYPE_ENUM } from '../constants/index.js';

const MedicalServiceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        // facilityName: { type: String, required: true },
        // facilityAddress: { type: String, required: true },
        originalPrice: { type: Number },
        currentPrice: { type: Number, required: true },
        type: { type: Number, required: true, default: MEDICAL_SERVICE_TYPE_ENUM.SPECIALITY },
        clinicId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Clinic' },
    },
    {
        timestamps: true,
        collection: 'MedicalService',
    },
);

const MedicalServiceModel = mongoose.model('MedicalService', MedicalServiceSchema);
export default MedicalServiceModel;
