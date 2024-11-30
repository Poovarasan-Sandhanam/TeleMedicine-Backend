"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../../controllers/auth.controller"));
const userValidator_1 = require("../../validation/userValidator");
const router = (0, express_1.Router)();
router.post('/register', userValidator_1.validateUserRegisterSchema, auth_controller_1.default.register);
router.post('/login', userValidator_1.validateUserLoginSchema, auth_controller_1.default.login);
exports.default = router;
