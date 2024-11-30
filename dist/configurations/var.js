"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
require("dotenv/config");
const env = process.env.NODE_ENV || 'development';
const config = {
    env,
    DEFAULT_LIMIT: 10,
    PAGE_LIMIT: 1,
};
exports.CONFIG = config;
