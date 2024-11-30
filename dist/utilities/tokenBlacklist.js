"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenBlacklisted = exports.addToBlacklist = void 0;
const tokenBlacklist = new Set();
const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};
exports.addToBlacklist = addToBlacklist;
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
exports.isTokenBlacklisted = isTokenBlacklisted;
