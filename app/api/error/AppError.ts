export class AppError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Example usage in an API route:
// try {
//     checkSomethingThatThrowAppError();
//     return new Response("Order API is working", { status: 200 });
//   } catch (error) {
//     if (error instanceof AppError) {
//       return new Response(error.message, { status: error.status });
//     } else {
//       return new Response("Internal Server Error", { status: 500 });
//     }
//   }
