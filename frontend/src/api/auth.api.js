import api from "./axios";

export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getCurrentUser = () => api.post("/auth/current-user");
export const logout = () => api.post("/auth/logout");
export const refreshToken = () => api.post("/auth/refresh-token");


export const resendEmailVerification = () => 
    api.post("/auth/resend-email-verification");

// Password management
export const changeCurrentPassword = (data) => 
    api.post("/auth/change-password", data);

export const forgotPasswordRequest = (email) => 
    api.post("/auth/forgot-password", { email });

export const resetForgotPassword = (resetToken, newPassword) => 
    api.post(`/auth/reset-password/${resetToken}`, { newPassword });

// Email verification
export const verifyEmail = (verificationToken) => 
    api.get(`/auth/verify-email/${verificationToken}`); 



