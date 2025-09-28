import {
  type User,
  type InsertUser,
  type Crop,
  type InsertCrop,
  type ManagementProtocol,
  type InsertProtocol,
  type Recommendation,
  type InsertRecommendation,
  type ProductivityCalculation,
  type InsertCalculation,
  type GeospatialAnalysis,
  type InsertGeospatial,
  type CropField,
  type InsertCropField,
  type MonitoringData,
  type InsertMonitoringData,
  type Alert,
  type InsertAlert,
  type AlertSubscription,
  type InsertAlertSubscription
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Connection test
  testConnection(): Promise<void>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Crop operations
  getAllCrops(): Promise<Crop[]>;
  getCrop(id: string): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;

  // Protocol operations
  getAllProtocols(): Promise<ManagementProtocol[]>;
  getProtocol(id: string): Promise<ManagementProtocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<ManagementProtocol>;

  // Recommendation operations
  getRecommendationsByUser(userId: string): Promise<Recommendation[]>;
  getRecommendation(id: string): Promise<Recommendation | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: string, recommendation: Partial<Recommendation>): Promise<Recommendation | undefined>;
  deleteRecommendation(id: string): Promise<boolean>;

  // Calculation operations
  getCalculationsByUser(userId: string): Promise<ProductivityCalculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<ProductivityCalculation>;

  // Geospatial operations
  getGeospatialByUser(userId: string): Promise<GeospatialAnalysis[]>;
  createGeospatial(analysis: InsertGeospatial): Promise<GeospatialAnalysis>;

  // Crop field operations
  getCropFieldsByUser(userId: string): Promise<CropField[]>;
  getCropField(id: string): Promise<CropField | undefined>;
  createCropField(field: InsertCropField): Promise<CropField>;
  updateCropField(id: string, field: Partial<CropField>): Promise<CropField | undefined>;
  deleteCropField(id: string): Promise<boolean>;

  // Monitoring data operations
  getMonitoringDataByField(fieldId: string): Promise<MonitoringData[]>;
  getLatestMonitoringData(fieldId: string, sensorType?: string): Promise<MonitoringData[]>;
  createMonitoringData(data: InsertMonitoringData): Promise<MonitoringData>;

  // Alert operations
  getAlertsByUser(userId: string): Promise<Alert[]>;
  getUnreadAlertsByUser(userId: string): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<Alert>): Promise<Alert | undefined>;
  markAlertAsRead(id: string): Promise<boolean>;
  markAlertAsResolved(id: string): Promise<boolean>;

  // Alert subscription operations
  getSubscriptionsByUser(userId: string): Promise<AlertSubscription[]>;
  createSubscription(subscription: InsertAlertSubscription): Promise<AlertSubscription>;
  updateSubscription(id: string, subscription: Partial<AlertSubscription>): Promise<AlertSubscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private crops: Map<string, Crop> = new Map();
  private protocols: Map<string, ManagementProtocol> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private calculations: Map<string, ProductivityCalculation> = new Map();
  private geospatial: Map<string, GeospatialAnalysis> = new Map();
  private cropFields: Map<string, CropField> = new Map();
  private monitoringData: Map<string, MonitoringData> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertSubscriptions: Map<string, AlertSubscription> = new Map();

  constructor() {
    this.seedData();
  }

  async testConnection(): Promise<void> {
    // Test database connection - for in-memory storage, just verify we can access data
    try {
      await this.getAllCrops();
      return Promise.resolve();
    } catch (error) {
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private seedData() {
    // Seed crops
    const crops: InsertCrop[] = [
      { name: "Soja", scientificName: "Glycine max", category: "Grãos", ibgeCode: "2713", emoji: "🌱" },
      { name: "Milho", scientificName: "Zea mays", category: "Grãos", ibgeCode: "2707", emoji: "🌽" },
      { name: "Café", scientificName: "Coffea arabica", category: "Permanente", ibgeCode: "2701", emoji: "☕" },
      { name: "Cana-de-açúcar", scientificName: "Saccharum officinarum", category: "Industrial", ibgeCode: "2704", emoji: "🍊" },
      { name: "Trigo", scientificName: "Triticum aestivum", category: "Grãos", ibgeCode: "2714", emoji: "🌾" },
      { name: "Amendoim", scientificName: "Arachis hypogaea", category: "Oleaginosa", ibgeCode: "2699", emoji: "🥜" },
      { name: "Algodão", scientificName: "Gossypium spp.", category: "Fibra", ibgeCode: "2700", emoji: "☁️" },
      { name: "Arroz", scientificName: "Oryza sativa", category: "Grãos", ibgeCode: "2703", emoji: "🌾" },
    ];

    crops.forEach(crop => this.createCrop(crop));

    // Seed protocols
    const protocols: InsertProtocol[] = [
      { name: "Convencional", description: "Manejo tradicional com agroquímicos", type: "conventional" },
      { name: "Orgânico", description: "Sem uso de produtos sintéticos", type: "organic" },
      { name: "Biológico", description: "Controle biológico integrado", type: "biological" },
      { name: "Convencional + Biológico", description: "Manejo integrado híbrido", type: "conventional_biological" },
    ];

    protocols.forEach(protocol => this.createProtocol(protocol));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isPremium: insertUser.isPremium || false,
      linkedAgronomistId: insertUser.linkedAgronomistId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Crop operations
  async getAllCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = randomUUID();
    const crop: Crop = {
      ...insertCrop,
      id,
      scientificName: insertCrop.scientificName || null,
      category: insertCrop.category || null,
      ibgeCode: insertCrop.ibgeCode || null,
      emoji: insertCrop.emoji || null,
      createdAt: new Date()
    };
    this.crops.set(id, crop);
    return crop;
  }

  // Protocol operations
  async getAllProtocols(): Promise<ManagementProtocol[]> {
    return Array.from(this.protocols.values());
  }

  async getProtocol(id: string): Promise<ManagementProtocol | undefined> {
    return this.protocols.get(id);
  }

  async createProtocol(insertProtocol: InsertProtocol): Promise<ManagementProtocol> {
    const id = randomUUID();
    const protocol: ManagementProtocol = {
      ...insertProtocol,
      id,
      description: insertProtocol.description || null,
      createdAt: new Date()
    };
    this.protocols.set(id, protocol);
    return protocol;
  }

  // Recommendation operations
  async getRecommendationsByUser(userId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => rec.userId === userId);
  }

  async getRecommendation(id: string): Promise<Recommendation | undefined> {
    return this.recommendations.get(id);
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = {
      ...insertRecommendation,
      id,
      status: insertRecommendation.status || "pending",
      priority: insertRecommendation.priority || "medium",
      scheduledDate: insertRecommendation.scheduledDate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async updateRecommendation(id: string, recData: Partial<Recommendation>): Promise<Recommendation | undefined> {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) return undefined;

    const updated = { ...recommendation, ...recData, updatedAt: new Date() };
    this.recommendations.set(id, updated);
    return updated;
  }

  async deleteRecommendation(id: string): Promise<boolean> {
    return this.recommendations.delete(id);
  }

  // Calculation operations
  async getCalculationsByUser(userId: string): Promise<ProductivityCalculation[]> {
    return Array.from(this.calculations.values()).filter(calc => calc.userId === userId);
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<ProductivityCalculation> {
    const id = randomUUID();
    const calculation: ProductivityCalculation = {
      ...insertCalculation,
      id,
      ibgeYield: insertCalculation.ibgeYield || null,
      estimatedProduction: insertCalculation.estimatedProduction || null,
      estimatedValue: insertCalculation.estimatedValue || null,
      createdAt: new Date()
    };
    this.calculations.set(id, calculation);
    return calculation;
  }

  // Geospatial operations
  async getGeospatialByUser(userId: string): Promise<GeospatialAnalysis[]> {
    return Array.from(this.geospatial.values()).filter(geo => geo.userId === userId);
  }

  async createGeospatial(insertGeospatial: InsertGeospatial): Promise<GeospatialAnalysis> {
    const id = randomUUID();
    const analysis: GeospatialAnalysis = {
      ...insertGeospatial,
      id,
      latitude: insertGeospatial.latitude || null,
      longitude: insertGeospatial.longitude || null,
      fileName: insertGeospatial.fileName || null,
      fileType: insertGeospatial.fileType || null,
      fileContent: insertGeospatial.fileContent || null,
      analysisResults: insertGeospatial.analysisResults || null,
      isPremium: insertGeospatial.isPremium !== undefined ? insertGeospatial.isPremium : true,
      createdAt: new Date()
    };
    this.geospatial.set(id, analysis);
    return analysis;
  }

  // Crop field operations
  async getCropFieldsByUser(userId: string): Promise<CropField[]> {
    return Array.from(this.cropFields.values()).filter(field => field.userId === userId);
  }

  async getCropField(id: string): Promise<CropField | undefined> {
    return this.cropFields.get(id);
  }

  async createCropField(insertField: InsertCropField): Promise<CropField> {
    const id = randomUUID();
    const field: CropField = {
      ...insertField,
      id,
      latitude: insertField.latitude || null,
      longitude: insertField.longitude || null,
      plantingDate: insertField.plantingDate || null,
      expectedHarvestDate: insertField.expectedHarvestDate || null,
      growthStage: insertField.growthStage || "planted",
      status: insertField.status || "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cropFields.set(id, field);
    return field;
  }

  async updateCropField(id: string, fieldData: Partial<CropField>): Promise<CropField | undefined> {
    const field = this.cropFields.get(id);
    if (!field) return undefined;

    const updated = { ...field, ...fieldData, updatedAt: new Date() };
    this.cropFields.set(id, updated);
    return updated;
  }

  async deleteCropField(id: string): Promise<boolean> {
    return this.cropFields.delete(id);
  }

  // Monitoring data operations
  async getMonitoringDataByField(fieldId: string): Promise<MonitoringData[]> {
    return Array.from(this.monitoringData.values())
      .filter(data => data.fieldId === fieldId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async getLatestMonitoringData(fieldId: string, sensorType?: string): Promise<MonitoringData[]> {
    let data = Array.from(this.monitoringData.values())
      .filter(d => d.fieldId === fieldId);

    if (sensorType) {
      data = data.filter(d => d.sensorType === sensorType);
    }

    return data
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
      .slice(0, 10); // Latest 10 readings
  }

  async createMonitoringData(insertData: InsertMonitoringData): Promise<MonitoringData> {
    const id = randomUUID();
    const data: MonitoringData = {
      ...insertData,
      id,
      timestamp: new Date(),
      createdAt: new Date()
    };
    this.monitoringData.set(id, data);
    return data;
  }

  // Alert operations
  async getAlertsByUser(userId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUnreadAlertsByUser(userId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId && !alert.isRead)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      fieldId: insertAlert.fieldId || null,
      isRead: insertAlert.isRead || false,
      isResolved: insertAlert.isResolved || false,
      actionRequired: insertAlert.actionRequired || null,
      triggerValue: insertAlert.triggerValue || null,
      thresholdValue: insertAlert.thresholdValue || null,
      createdAt: new Date(),
      resolvedAt: insertAlert.resolvedAt || null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, alertData: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updated = { ...alert, ...alertData };
    this.alerts.set(id, updated);
    return updated;
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    alert.isRead = true;
    this.alerts.set(id, alert);
    return true;
  }

  async markAlertAsResolved(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    this.alerts.set(id, alert);
    return true;
  }

  // Alert subscription operations
  async getSubscriptionsByUser(userId: string): Promise<AlertSubscription[]> {
    return Array.from(this.alertSubscriptions.values()).filter(sub => sub.userId === userId);
  }

  async createSubscription(insertSubscription: InsertAlertSubscription): Promise<AlertSubscription> {
    const id = randomUUID();
    const subscription: AlertSubscription = {
      ...insertSubscription,
      id,
      fieldId: insertSubscription.fieldId || null,
      isEnabled: insertSubscription.isEnabled !== undefined ? insertSubscription.isEnabled : true,
      notificationMethod: insertSubscription.notificationMethod || "app",
      thresholdSettings: insertSubscription.thresholdSettings || null,
      createdAt: new Date()
    };
    this.alertSubscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, subscriptionData: Partial<AlertSubscription>): Promise<AlertSubscription | undefined> {
    const subscription = this.alertSubscriptions.get(id);
    if (!subscription) return undefined;

    const updated = { ...subscription, ...subscriptionData };
    this.alertSubscriptions.set(id, updated);
    return updated;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return this.alertSubscriptions.delete(id);
  }
}

export const storage = new MemStorage();
