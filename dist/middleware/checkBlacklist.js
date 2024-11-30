"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenBlacklist_1 = require("../utilities/tokenBlacklist");
const checkBlacklist = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (token && (0, tokenBlacklist_1.isTokenBlacklisted)(token)) {
        return res.status(401).json({ message: 'Token is blacklisted' });
    }
    next();
};
exports.default = checkBlacklist;
