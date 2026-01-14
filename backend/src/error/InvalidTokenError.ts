import { AppError } from "./AppError";

export class InvalidTokenError extends AppError {
  constructor(message = "Invalid Token") {
    super({ message, statusCode: 401 });
  }
}
