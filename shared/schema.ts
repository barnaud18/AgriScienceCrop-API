import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role", { enum: ["farmer", "agronomist"] }).notNull(),
  isPremium: boolean("is_premium").default(false),
  linkedAgronomistId: varchar("linked_agronomist_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  scientificName: text("scientific_name"),
  category: text("category"),
  ibgeCode: text("ibge_code"),
  emoji: text("emoji"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const managementProtocols = pgTable("management_protocols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["conventional", "organic", "biological", "conventional_biological"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cropId: varchar("crop_id").notNull(),
  protocolId: varchar("protocol_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["soil_management", "crop_management", "pest_management"] }).notNull(),
  status: text("status", { enum: ["active", "pending", "completed", "scheduled"] }).default("pending"),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productivityCalculations = pgTable("productivity_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cropId: varchar("crop_id").notNull(),
  municipality: text("municipality").notNull(),
  state: text("state").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  ibgeYield: decimal("ibge_yield", { precision: 10, scale: 2 }),
  estimatedProduction: decimal("estimated_production", { precision: 10, scale: 2 }),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const geospatialAnalysis = pgTable("geospatial_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  fileName: text("file_name"),
  fileType: text("file_type"),
  fileContent: text("file_content"),
  analysisResults: text("analysis_results"),
  isPremium: boolean("is_premium").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cropFields = pgTable("crop_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  cropId: varchar("crop_id").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  plantingDate: timestamp("planting_date"),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  growthStage: text("growth_stage", { enum: ["planted", "germination", "vegetative", "flowering", "fruiting", "maturation", "harvest"] }).default("planted"),
  status: text("status", { enum: ["active", "inactive", "harvested"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const monitoringData = pgTable("monitoring_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldId: varchar("field_id").notNull(),
  sensorType: text("sensor_type", { enum: ["soil_moisture", "soil_temperature", "air_temperature", "humidity", "ph", "nutrients", "weather"] }).notNull(),
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fieldId: varchar("field_id"),
  type: text("type", { enum: ["weather", "pest", "disease", "soil", "irrigation", "harvest"] }).notNull(),
  severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  actionRequired: text("action_required"),
  triggerValue: decimal("trigger_value", { precision: 10, scale: 4 }),
  thresholdValue: decimal("threshold_value", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const alertSubscriptions = pgTable("alert_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  alertType: text("alert_type").notNull(),
  fieldId: varchar("field_id"),
  isEnabled: boolean("is_enabled").default(true),
  notificationMethod: text("notification_method", { enum: ["app", "email", "sms"] }).default("app"),
  thresholdSettings: text("threshold_settings"), // JSON string for custom thresholds
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
});

export const insertProtocolSchema = createInsertSchema(managementProtocols).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalculationSchema = createInsertSchema(productivityCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertGeospatialSchema = createInsertSchema(geospatialAnalysis).omit({
  id: true,
  createdAt: true,
});

export const insertCropFieldSchema = createInsertSchema(cropFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonitoringDataSchema = createInsertSchema(monitoringData).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSubscriptionSchema = createInsertSchema(alertSubscriptions).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type ManagementProtocol = typeof managementProtocols.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type ProductivityCalculation = typeof productivityCalculations.$inferSelect;
export type InsertGeospatial = z.infer<typeof insertGeospatialSchema>;
export type GeospatialAnalysis = typeof geospatialAnalysis.$inferSelect;
export type InsertCropField = z.infer<typeof insertCropFieldSchema>;
export type CropField = typeof cropFields.$inferSelect;
export type InsertMonitoringData = z.infer<typeof insertMonitoringDataSchema>;
export type MonitoringData = typeof monitoringData.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlertSubscription = z.infer<typeof insertAlertSubscriptionSchema>;
export type AlertSubscription = typeof alertSubscriptions.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
