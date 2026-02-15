import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    // DEBUG: Log the errors
    console.log("🔍 Validation errors:", errors.array());
    console.log("🔍 Request body:", req.body);
    
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map((err) => {
        extractedErrors.push({ [err.path]: err.msg });
        console.log(`❌ Error: ${err.path} - ${err.msg}`);
    });
    
    throw new ApiError(422, "Received data is not valid.", extractedErrors);
};