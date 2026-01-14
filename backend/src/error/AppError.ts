type Constructor = {
  message: string;
  statusCode: number;
};

export class AppError extends Error {
  public readonly statusCode: number;

  constructor({ message, statusCode }: Constructor) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}
