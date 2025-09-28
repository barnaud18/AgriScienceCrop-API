import express, { type Request, Response, NextFunction } from "express";
import swaggerUi from 'swagger-ui-express';
import { specs } from '../swagger.config.js';
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

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

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AgriScienceCrop API Documentation',
    customfavIcon: '/favicon.ico',
  }));

  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // Start server
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 AgriScienceCrop API running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();