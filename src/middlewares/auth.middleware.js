import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

//verifyJWT answers exactly one question:
//“Who is making this request, and are they allowed to exist here?”
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401, "Unauthorised request")
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
         if(!user){
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user;
        next() //goto next middleware or directly to controller
    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }

})