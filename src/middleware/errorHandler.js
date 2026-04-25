function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || "INTERNAL_SERVER_ERROR";

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: error.message || "Something went wrong",
      details: error.details || null
    }
  });
}

module.exports = errorHandler;
