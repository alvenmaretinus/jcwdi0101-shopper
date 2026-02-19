import express from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const uploadsAuthMiddleware: express.RequestHandler = async (req, res, next) => {
  try {
    // Allow authentication via x-api-key header for programmatic access
    const apiKey = req.header("x-api-key");
    const kommerceApiKey = process.env.KOMERCE_API_KEY;
    if (apiKey && kommerceApiKey && apiKey === kommerceApiKey) {
      return next();
    }

    // Allow authenticated users via session cookie
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session?.user) {
      return next();
    }

    return res.status(401).json({
      error: "Unauthorized access to uploads. Provide valid authentication or x-api-key header.",
    });
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized access to uploads. Provide valid authentication or x-api-key header.",
    });
  }
};
