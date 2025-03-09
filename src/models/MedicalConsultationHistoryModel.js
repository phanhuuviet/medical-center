import mongoose from 'mongoose';

import {
    GENDER_ENUM,
    MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM,
    PAYMENT_METHOD_ENUM,
    PAYMENT_STATUS_ENUM,
} from '../constants/index.js';

const MedicalConsultationHistorySchema = new mongoose.Schema(
    {
        code: { type: String },
        patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        responsibilityDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        clinicId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Clinic' },
        examinationDate: { type: Date, required: true },
        clinicScheduleId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ClinicSchedule' },
        examinationReason: { type: String, required: true },
        patientStatus: { type: String },
        diagnosis: { type: String },
        reExaminateDate: { type: Date },
        noteFromDoctor: { type: String },
        medicalFee: { type: Number, required: true },
        medicalServiceName: { type: String, required: true },
        // facilityName: { type: String, required: true },
        // facilityAddress: { type: String, required: true },
        paymentMethod: { type: Number, required: true, default: PAYMENT_METHOD_ENUM.CASH },
        paymentStatus: { type: Number, default: PAYMENT_STATUS_ENUM.PAID },
        status: { type: Number, default: MEDICAL_CONSULTATION_HISTORY_STATUS_ENUM.PENDING },

        // Information of the patient
        patientName: { type: String, required: true },
        patientGender: { type: Number, required: true, default: GENDER_ENUM.MALE },
        patientPhoneNumber: { type: String, required: true },
        patientEmail: { type: String, required: true },
        patientDateOfBirth: { type: Date, required: true },
        patientProvince: { type: String, required: true },
        patientDistrict: { type: String, required: true },
        patientAddress: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: 'MedicalConsultationHistory',
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

MedicalConsultationHistorySchema.virtual('patient', {
    ref: 'User',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true,
});

MedicalConsultationHistorySchema.virtual('responsibilityDoctor', {
    ref: 'Doctor',
    localField: 'responsibilityDoctorId',
    foreignField: '_id',
    justOne: true,
});

MedicalConsultationHistorySchema.virtual('clinic', {
    ref: 'Clinic',
    localField: 'clinicId',
    foreignField: '_id',
    justOne: true,
});

MedicalConsultationHistorySchema.virtual('clinicSchedule', {
    ref: 'ClinicSchedule',
    localField: 'clinicScheduleId',
    foreignField: '_id',
    justOne: true,
});

MedicalConsultationHistorySchema.pre('validate', function (next) {
    if (!this?.code) {
        this.code = this._id?.toString().substring(0, 12).toUpperCase();
    }
    next();
});

const MedicalConsultationHistoryModel = mongoose.model('MedicalConsultationHistory', MedicalConsultationHistorySchema);
export default MedicalConsultationHistoryModel;
