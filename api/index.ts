import { type VercelRequest, type VercelResponse } from "@vercel/node";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";

// Create Express app instance
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return (originalResJson as any).apply(res, [bodyJson, ...args]);
  } as any;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Register API routes
registerRoutes(app as any);

// Setup static file serving based on environment
app.use(express.static("dist/public"));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Helper function to adapt Vercel request to Express request
const adaptRequest = (req: VercelRequest): Request => {
  // Add missing Express properties
  const adapted = req as any;

  // Add common Express request methods
  adapted.get = function (name: string) {
    return this.headers[name.toLowerCase()];
  };
  adapted.header = function (name: string) {
    return this.headers[name.toLowerCase()];
  };
  adapted.accepts = function () {
    return adapted.get("accept");
  };
  adapted.acceptsCharsets = function () {
    return true;
  };
  adapted.acceptsEncodings = function () {
    return ["gzip", "deflate"];
  };
  adapted.acceptsLanguages = function () {
    return adapted.get("accept-language");
  };

  // Add Express-specific properties
  adapted.connection = req.socket;
  adapted.secure = req.headers["x-forwarded-proto"] === "https";
  adapted.ip = (req.headers["x-forwarded-for"] as string) || "127.0.0.1";
  adapted.ips = adapted.ip.split(",").map((ip: string) => ip.trim());
  adapted.protocol = adapted.secure ? "https" : "http";
  adapted.hostname = req.headers.host?.split(":")[0] || "localhost";
  adapted.subdomains = adapted.hostname.split(".").slice(0, -2);

  return adapted as Request;
};

// Export the serverless function handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    const adaptedReq = adaptRequest(req);
    const adaptedRes = res as unknown as Response;

    // Add Express-specific response methods if they don't exist
    if (!(adaptedRes as any).send) {
      (adaptedRes as any).send = function (body: any) {
        (this as any).end(body);
        return this;
      };
    }

    await new Promise<void>((resolve, reject) => {
      (app as any)(adaptedReq, adaptedRes, ((err: string | Error | null) => {
        if (err) {
          console.error(err);
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve();
      }) as NextFunction);
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development" ? String(error) : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
