import { NextFunction, Request, Response } from "express"
import moment from "moment"
import { validationResult } from 'express-validator';

const getISOTimestamp = (increaseDays = 0) => {
    try {
        // Get the current UTC time
        const currentUtcTime = moment.utc();
        // Add two days to the current UTC time
        const futureUtcTime = currentUtcTime.add(increaseDays, 'days');
        return futureUtcTime.valueOf()
    } catch (error: any) {
        throw new Error(error)
    }
}
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    //checking for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ status: false, message: errors.array()[0]?.msg })
    else next()
}
const isFloat = (x: any) => {
    return !!(x % 1)
  }
  
const getTotalPages = (totalData: number, perPage: number) => {
    const totalPage = totalData / perPage
    let totalPages: any = 1

    if (totalPage > 1) totalPages = totalPage

    if (isFloat(totalPages)) {
        totalPages = parseInt(totalPages) + 1
    }
    return totalPages
}

export default { getISOTimestamp, validateRequest, getTotalPages }
