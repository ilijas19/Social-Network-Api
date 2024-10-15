const CustomApiError = require("./custom-error");
const { StatusCodes } = require("http-status-codes");

class UnauthorizedError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
module.exports = UnauthorizedError;
