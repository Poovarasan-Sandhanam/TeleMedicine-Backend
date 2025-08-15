import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import DoctorType from "../models/doctor/doctorType.model";

// GET all doctor types
export const getDoctorTypes = async (req: Request, res: Response) => {
  try {
    const doctorTypes = await DoctorType.find({});
    return sendSuccess(res, doctorTypes, "Doctor Types fetched successfully", HttpStatusCode.OK);
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

// (Optional) Add new doctor type
export const addDoctorType = async (req: Request, res: Response) => {
  try {
    const { id, title, image } = req.body;
    if (!id || !title || !image) {
      return sendError(res, "id, title, and image are required", HttpStatusCode.BAD_REQUEST);
    }

    const exists = await DoctorType.findOne({ id });
    if (exists) {
      return sendError(res, "Doctor type with this ID already exists", HttpStatusCode.CONFLICT);
    }

    const newType = await DoctorType.create({ id, title, image });
    return sendSuccess(res, newType, "Doctor type added successfully", HttpStatusCode.CREATED);
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};
