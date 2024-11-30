"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * UserSchema for the database
 */
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    dob: { type: Date, required: false },
    contactNo: { type: Number, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isDoctor: { type: Boolean, required: false },
    doctorType: { type: String, required: false },
    gender: { type: String, required: false }
}, {
    timestamps: true,
    minimize: false,
});
userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});
exports.default = mongoose_1.default.model("User", userSchema);
