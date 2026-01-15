import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super({ message, statusCode: 404 });
  }
}
