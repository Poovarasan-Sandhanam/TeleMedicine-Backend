"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user/user.model"));
const getUserDetails = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield user_model_1.default.findOne(query);
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
const updateUserDetailsById = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let result = yield user_model_1.default.findOneAndUpdate({ _id: userId }, payload, { new: true });
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
const saveUserDetails = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.default.create(payload);
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.default = { getUserDetails, updateUserDetailsById, saveUserDetails };
