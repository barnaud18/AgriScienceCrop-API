import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AgriScienceCrop API",
      version: "1.0.0",
      description:
        "API para a plataforma AgriScienceCrop - Gestão Inteligente de Cultivos",
      contact: {
        name: "AgriScienceCrop Team",
        email: "contato@agriscience.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
      {
        url: "https://api.agriscience.com",
        description: "Servidor de Produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["farmer", "agronomist"] },
            isPremium: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Crop: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            scientificName: { type: "string" },
            category: { type: "string" },
            ibgeCode: { type: "string" },
            emoji: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Protocol: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            type: {
              type: "string",
              enum: [
                "conventional",
                "organic",
                "biological",
                "conventional_biological",
              ],
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Recommendation: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            cropId: { type: "string", format: "uuid" },
            protocolId: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            category: {
              type: "string",
              enum: ["soil_management", "crop_management", "pest_management"],
            },
            status: {
              type: "string",
              enum: ["active", "pending", "completed", "scheduled"],
            },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            scheduledDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ProductivityCalculation: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            cropId: { type: "string", format: "uuid" },
            municipality: { type: "string" },
            state: { type: "string" },
            area: { type: "number", format: "float" },
            ibgeYield: { type: "number", format: "float" },
            estimatedProduction: { type: "number", format: "float" },
            estimatedValue: { type: "number", format: "float" },
            year: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            status: { type: "integer" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server/routes.ts", "./swagger.docs.js"],
};

export const specs = swaggerJsdoc(options);
