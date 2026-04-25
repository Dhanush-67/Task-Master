const AppError = require("../utils/AppError");

function notFound(request, _response, next) {
  next(new AppError(404, `Route not found: ${request.method} ${request.originalUrl}`, "ROUTE_NOT_FOUND"));
}

module.exports = notFound;
