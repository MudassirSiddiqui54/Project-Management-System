import {User} from "../models/user.models.js"
import {ApiResponse} from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';
import {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        //save user in database
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password, role} = req.body;
    //find if user already exists in database
    const existedUser = await User.findOne({
        //if email or username matches, stop
        $or: [{username}, {email}]
    })
    if (existedUser){
        throw new ApiError(409, "User with email or username already exists!", []);
    };

    const user = await User.create({
        username,
        email,
        password,
        isEmailVerified: false
    })
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailGenContent: emailVerificationMailgenContent(
            user.username,
            `${process.env.CLIENT_URL}/verify-email/${unHashedToken}`
        )
    });
    //We don't need password, refreshToken, emailVerificationToken ... so we use -variable to exclude them from saving 
    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.");
    }
    return res
    .status(201)
    .json(new ApiResponse(201,
        {user: createdUser},
        "User registered successfully and verification email has been sent on your email."))
});

const login = asyncHandler(async (req, res) => {
    const {email, password, username} = req.body
    if(!email){
        throw new ApiError(400, "Email is required.")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400, "User does not exists.")
    }
    console.log("LOGIN isEmailVerified:", user.isEmailVerified);

    if(!(user.isEmailVerified)){
        throw new ApiError(403, "Please verify your email first")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid credentials.")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    
    const options = {
        httpOnly: true,
        secure: true,
		sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
    }
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in Successfully"
        ))
});

const logoutUser = asyncHandler(async (req, res) => {
	try {
		if (req.user?._id) {
			await User.findByIdAndUpdate(req.user._id, {
				$set: { refreshToken: "" },
			});
		}
	} catch (err) {
		// swallow error, logout must not fail
	}

	const options = {
		httpOnly: true,
		secure: true,
		sameSite: "none",
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json({ message: "User logged out" });
});


const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
})

const verifyEmail = asyncHandler(async (req, res) => {
    const {verificationToken} = req.params
    if(!verificationToken){
        throw new ApiError(400, "Email verification token is missing")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })
    if(!user){
        throw new ApiError(400, "Token is invalid or expired")
    }
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined

    user.isEmailVerified = true;
    await user.save({validateBeforeSave: false})


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                "Email is verified"
            )
        )
        .redirect(
		`${process.env.CLIENT_URL}/email-verified?success=true`
	);
})

const resendEmailVerification = asyncHandler(async (req, res) => {
    // Expect email in body instead of req.user
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required to resend verification link");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    if (user.isEmailVerified) {
        return res
            .status(409)
            .json(new ApiResponse(409, {}, "Email is already verified. Please log in."));
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailGenContent: emailVerificationMailgenContent(
            user.username,
            `${process.env.CLIENT_URL}/verify-email/${unHashedToken}` // notice no extra colon
        ),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Verification email has been sent. Check your inbox."));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorised access")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true,
			sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        user.refreshToken = newRefreshToken;
        await user.save()

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken, newRefreshToken},
                    "Access token refreshed"
                )
            )


    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }

})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, "User doesn't exist")
    }
    const {hashedToken, unHashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry
    await user.save({validateBeforeSave:false})
    
    await sendEmail({
        email: user.email,
        subject: "Password reset request",
        mailGenContent: forgotPasswordMailgenContent(
            user.username,
            `${process.env.CLIENT_URL}/reset-password/${unHashedToken}`
        )
    })
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset mail has been sent on your email id"
            )
        )
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const {resetToken} = req.params
    const {newPassword} = req.body
        console.log("Reset token received:", resetToken);
    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    console.log("Hashed token:", hashedToken);
    const user =await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })
    if(!user){
        throw new ApiError(489, "Token is invalid or expired")
    }
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    user.password = newPassword
    await user.save({validateBeforeSave:false})
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password reset successfully")
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

export { 
    registerUser,
    login,
    logoutUser, 
    getCurrentUser, 
    verifyEmail, 
    resendEmailVerification, 
    refreshAccessToken,
    forgotPasswordRequest, 
    resetForgotPassword, 
    changeCurrentPassword
 }
