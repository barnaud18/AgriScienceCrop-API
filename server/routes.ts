import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  loginSchema,
  registerSchema,
  insertRecommendationSchema,
  insertCalculationSchema,
  insertGeospatialSchema,
  insertCropFieldSchema,
  insertMonitoringDataSchema,
  insertAlertSchema,
  insertAlertSubscriptionSchema
} from "@shared/schema";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  userId?: string;
}

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// IBGE API service
class IBGEService {
  private baseUrl = "https://apisidra.ibge.gov.br";

  async getProductivityData(cropCode: string, municipalityCode?: string, year: number = 2023) {
    try {
      // PAM table for municipal agricultural production
      const tableId = "1612";
      const locationFilter = municipalityCode ? `n6/${municipalityCode}` : "n6/all";
      const url = `${this.baseUrl}/values/t/${tableId}/${locationFilter}/p/${year}/v/214,216/c48/${cropCode}`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data || data.length === 0) {
        return null;
      }

      // Process IBGE response format
      const processedData = data.map((row: any[]) => ({
        territory: row[1], // Territory name
        year: row[2],      // Year
        variable: row[3],  // Variable (production/yield)
        crop: row[4],      // Crop
        value: parseFloat(row[5]) || 0 // Value
      }));

      return processedData;
    } catch (error) {
      console.error("IBGE API Error:", error);
      return null;
    }
  }

  async getMunicipalityCode(municipalityName: string, state: string) {
    try {
      // Use IBGE localities API to get municipality code
      const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
      const municipalities = response.data;

      const municipality = municipalities.find((m: any) =>
        m.nome.toLowerCase().includes(municipalityName.toLowerCase())
      );

      return municipality?.id || null;
    } catch (error) {
      console.error("Municipality code error:", error);
      return null;
    }
  }
}

const ibgeService = new IBGEService();

export async function registerRoutes(app: Express): Promise<Server> {

  /**
   * @swagger
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Verificação de saúde da API
   *     description: Retorna o status de saúde da aplicação e informações do sistema
   */
  app.get("/health", async (req, res) => {
    try {
      // Test database connection
      await storage.testConnection();
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0"
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const { confirmPassword, ...userInsert } = userData;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(userInsert.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userInsert.password, 10);

      const user = await storage.createUser({
        ...userInsert,
        password: hashedPassword
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isPremium: user.isPremium
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isPremium: user.isPremium
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isPremium: user.isPremium
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Crops routes
  app.get("/api/crops", async (req, res) => {
    try {
      const crops = await storage.getAllCrops();
      res.json(crops);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Protocols routes
  app.get("/api/protocols", async (req, res) => {
    try {
      const protocols = await storage.getAllProtocols();
      res.json(protocols);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations", authenticateToken, async (req: any, res) => {
    try {
      const recommendations = await storage.getRecommendationsByUser(req.userId);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/recommendations", authenticateToken, async (req: any, res) => {
    try {
      const recData = insertRecommendationSchema.parse({
        ...req.body,
        userId: req.userId
      });

      const recommendation = await storage.createRecommendation(recData);
      res.status(201).json(recommendation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/recommendations/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const recommendation = await storage.updateRecommendation(id, req.body);

      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      res.json(recommendation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/recommendations/:id", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRecommendation(id);

      if (!deleted) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate recommendations based on crop and protocol
  app.post("/api/recommendations/generate", authenticateToken, async (req: any, res) => {
    try {
      const { cropId, protocolId } = req.body;

      if (!cropId || !protocolId) {
        return res.status(400).json({ message: "Crop and protocol required" });
      }

      const crop = await storage.getCrop(cropId);
      const protocol = await storage.getProtocol(protocolId);

      if (!crop || !protocol) {
        return res.status(404).json({ message: "Crop or protocol not found" });
      }

      // Generate recommendations based on crop and protocol
      const baseRecommendations = [
        {
          title: `Manejo de Solo - ${crop.name}`,
          description: `Análise de solo e correção para cultivo de ${crop.name} com protocolo ${protocol.name}`,
          category: "soil_management" as const,
          status: "active" as const,
          priority: "high" as const
        },
        {
          title: `Controle de Pragas - ${crop.name}`,
          description: `Monitoramento e controle integrado de pragas para ${crop.name}`,
          category: "pest_management" as const,
          status: "pending" as const,
          priority: "medium" as const
        },
        {
          title: `Nutrição Foliar - ${crop.name}`,
          description: `Aplicação de micronutrientes para ${crop.name}`,
          category: "crop_management" as const,
          status: "scheduled" as const,
          priority: "medium" as const
        }
      ];

      const recommendations = [];
      for (const recData of baseRecommendations) {
        const recommendation = await storage.createRecommendation({
          ...recData,
          userId: req.userId,
          cropId,
          protocolId
        });
        recommendations.push(recommendation);
      }

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Productivity calculation with IBGE data
  app.post("/api/productivity/calculate", authenticateToken, async (req: any, res) => {
    try {
      const { municipality, state, area, cropId, year = 2023 } = req.body;

      if (!municipality || !state || !area || !cropId) {
        return res.status(400).json({ message: "Municipality, state, area, and crop required" });
      }

      const crop = await storage.getCrop(cropId);
      if (!crop || !crop.ibgeCode) {
        return res.status(404).json({ message: "Crop not found or no IBGE code available" });
      }

      // Get municipality code
      const municipalityCode = await ibgeService.getMunicipalityCode(municipality, state);

      // Get IBGE productivity data
      const ibgeData = await ibgeService.getProductivityData(crop.ibgeCode, municipalityCode, year);

      let yieldValue = 3000; // Default fallback

      if (ibgeData && ibgeData.length > 0) {
        // Find yield data (variable for productivity)
        const yieldData = ibgeData.find((d: any) => d.variable && d.variable.includes("produtividade"));
        if (yieldData && yieldData.value > 0) {
          yieldValue = yieldData.value;
        }
      }

      const areaNum = parseFloat(area);
      const estimatedProduction = (yieldValue * areaNum) / 1000; // Convert to tons
      const estimatedValue = estimatedProduction * 5000; // Approximate value per ton

      // Save calculation
      const calculation = await storage.createCalculation({
        userId: req.userId,
        cropId,
        municipality,
        state,
        area: areaNum.toString(),
        ibgeYield: yieldValue.toString(),
        estimatedProduction: estimatedProduction.toString(),
        estimatedValue: estimatedValue.toString(),
        year
      });

      res.json({
        calculation,
        data: {
          yield: yieldValue,
          totalProduction: estimatedProduction,
          marketValue: estimatedValue,
          source: "IBGE SIDRA API"
        }
      });
    } catch (error: any) {
      console.error("Calculation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's calculations
  app.get("/api/productivity/calculations", authenticateToken, async (req: any, res) => {
    try {
      const calculations = await storage.getCalculationsByUser(req.userId);
      res.json(calculations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Professional geospatial analysis (premium feature)
  app.post("/api/professional/analyze", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user?.isPremium) {
        return res.status(403).json({ message: "Premium subscription required" });
      }

      const geoData = insertGeospatialSchema.parse({
        ...req.body,
        userId: req.userId,
        isPremium: true
      });

      // Mock geospatial analysis results
      const analysisResults = {
        soilType: "Latossolo Vermelho",
        elevation: "550m",
        slope: "2-5%",
        drainageClass: "Bem drenado",
        recommendations: [
          "Área adequada para cultivos anuais",
          "Considerar terraçamento em áreas inclinadas",
          "Monitoramento de erosão necessário"
        ]
      };

      const analysis = await storage.createGeospatial({
        ...geoData,
        analysisResults: JSON.stringify(analysisResults)
      });

      res.json({
        analysis,
        results: analysisResults
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's geospatial analyses
  app.get("/api/professional/analyses", authenticateToken, async (req: any, res) => {
    try {
      const analyses = await storage.getGeospatialByUser(req.userId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const recommendations = await storage.getRecommendationsByUser(req.userId);
      const calculations = await storage.getCalculationsByUser(req.userId);

      const stats = {
        cropsAnalyzed: calculations.length,
        avgProductivity: calculations.length > 0
          ? calculations.reduce((sum, calc) => sum + parseFloat(calc.ibgeYield || "0"), 0) / calculations.length
          : 0,
        activeRecommendations: recommendations.filter(r => r.status === "active").length,
        totalArea: calculations.reduce((sum, calc) => sum + parseFloat(calc.area), 0)
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // === MONITORING API ROUTES ===

  // Crop Fields Management
  app.get("/api/monitoring/fields", authenticateToken, async (req: any, res) => {
    try {
      const fields = await storage.getCropFieldsByUser(req.userId);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/monitoring/fields", authenticateToken, async (req: any, res) => {
    try {
      const fieldData = insertCropFieldSchema.parse({ ...req.body, userId: req.userId });
      const field = await storage.createCropField(fieldData);
      res.status(201).json(field);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/monitoring/fields/:id", authenticateToken, async (req: any, res) => {
    try {
      const field = await storage.updateCropField(req.params.id, req.body);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      res.json(field);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/monitoring/fields/:id", authenticateToken, async (req: any, res) => {
    try {
      const deleted = await storage.deleteCropField(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Field not found" });
      }
      res.json({ message: "Field deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Monitoring Data
  app.get("/api/monitoring/data/:fieldId", authenticateToken, async (req: any, res) => {
    try {
      const { sensorType } = req.query;
      const data = sensorType
        ? await storage.getLatestMonitoringData(req.params.fieldId, sensorType as string)
        : await storage.getMonitoringDataByField(req.params.fieldId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/monitoring/data", authenticateToken, async (req: any, res) => {
    try {
      const monitoringData = insertMonitoringDataSchema.parse(req.body);
      const data = await storage.createMonitoringData(monitoringData);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Alerts Management
  app.get("/api/monitoring/alerts", authenticateToken, async (req: any, res) => {
    try {
      const { unread } = req.query;
      const alerts = unread === 'true'
        ? await storage.getUnreadAlertsByUser(req.userId)
        : await storage.getAlertsByUser(req.userId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/monitoring/alerts", authenticateToken, async (req: any, res) => {
    try {
      const alertData = insertAlertSchema.parse({ ...req.body, userId: req.userId });
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/monitoring/alerts/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const success = await storage.markAlertAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ message: "Alert marked as read" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/monitoring/alerts/:id/resolve", authenticateToken, async (req: any, res) => {
    try {
      const success = await storage.markAlertAsResolved(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ message: "Alert resolved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Alert Subscriptions
  app.get("/api/monitoring/subscriptions", authenticateToken, async (req: any, res) => {
    try {
      const subscriptions = await storage.getSubscriptionsByUser(req.userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/monitoring/subscriptions", authenticateToken, async (req: any, res) => {
    try {
      const subscriptionData = insertAlertSubscriptionSchema.parse({ ...req.body, userId: req.userId });
      const subscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/monitoring/subscriptions/:id", authenticateToken, async (req: any, res) => {
    try {
      const subscription = await storage.updateSubscription(req.params.id, req.body);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/monitoring/subscriptions/:id", authenticateToken, async (req: any, res) => {
    try {
      const deleted = await storage.deleteSubscription(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json({ message: "Subscription deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store authenticated connections
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'auth' && data.token) {
          // Authenticate WebSocket connection
          jwt.verify(data.token, JWT_SECRET, (err: any, decoded: any) => {
            if (!err && decoded?.userId) {
              clients.set(decoded.userId, ws);
              ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
              console.log(`WebSocket authenticated for user ${decoded.userId}`);
            } else {
              ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid token' }));
              ws.close();
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from the map when disconnected
      const clientEntries = Array.from(clients.entries());
      for (const [userId, client] of clientEntries) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`WebSocket disconnected for user ${userId}`);
          break;
        }
      }
    });

    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  // Broadcast function for real-time updates
  const broadcastToUser = (userId: string, data: any) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  };

  // Broadcast function for all users
  const broadcastToAll = (data: any) => {
    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Enhance monitoring routes with real-time updates
  const originalCreateMonitoringData = storage.createMonitoringData;
  storage.createMonitoringData = async (data) => {
    const result = await originalCreateMonitoringData.call(storage, data);

    // Get field info to find the owner
    const field = await storage.getCropField(data.fieldId);
    if (field) {
      broadcastToUser(field.userId, {
        type: 'monitoring_data',
        data: result
      });
    }

    return result;
  };

  const originalCreateAlert = storage.createAlert;
  storage.createAlert = async (alertData) => {
    const result = await originalCreateAlert.call(storage, alertData);

    // Broadcast alert to user
    broadcastToUser(alertData.userId, {
      type: 'new_alert',
      alert: result
    });

    return result;
  };

  return httpServer;
}
