class ApiResponse{
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;//any status code above 400 is considered an error
    }
}

export { ApiResponse };