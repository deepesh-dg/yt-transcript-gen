export default function makeResponse<T>(statusCode = 200, data: T) {
    return {
        statusCode,
        success: statusCode < 400,
        data: statusCode < 400 ? data : null,
        message: statusCode < 400 ? "" : data,
    };
}
