# 📚 API Documentation - AgriScienceCrop

## Swagger UI

Complete API documentation is available through Swagger UI:

**URL:** http://localhost:3000/api-docs

## Documentation Features

### ✅ Documented Endpoints

1. **Health Check**
   - `GET /health` - API health verification

2. **Authentication**
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/auth/me` - Logged user information

3. **Crops**
   - `GET /api/crops` - List all crops

4. **Protocols**
   - `GET /api/protocols` - List all management protocols

5. **Recommendations**
   - `GET /api/recommendations` - List user recommendations
   - `POST /api/recommendations` - Create new recommendation
   - `POST /api/recommendations/generate` - Generate automatic recommendations

6. **Productivity**
   - `POST /api/productivity/calculate` - Calculate productivity
   - `GET /api/productivity/calculations` - Calculation history

### 🔧 Swagger Features

- **Interactive Interface**: Test endpoints directly in the browser
- **JWT Authentication**: Integrated authentication system
- **Complete Schemas**: Detailed definitions of all data models
- **Examples**: Request and response examples
- **Validation**: Validation specifications for all fields

### 📋 Data Models

#### User
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "farmer | agronomist",
  "isPremium": "boolean",
  "createdAt": "datetime"
}
```

#### Crop
```json
{
  "id": "uuid",
  "name": "string",
  "scientificName": "string",
  "category": "string",
  "ibgeCode": "string",
  "emoji": "string",
  "createdAt": "datetime"
}
```

#### Protocol
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "type": "conventional | organic | biological | conventional_biological",
  "createdAt": "datetime"
}
```

#### Recommendation
```json
{
  "id": "uuid",
  "userId": "uuid",
  "cropId": "uuid",
  "protocolId": "uuid",
  "title": "string",
  "description": "string",
  "category": "soil_management | crop_management | pest_management",
  "status": "active | pending | completed | scheduled",
  "priority": "low | medium | high",
  "scheduledDate": "datetime",
  "createdAt": "datetime"
}
```

#### ProductivityCalculation
```json
{
  "id": "uuid",
  "userId": "uuid",
  "cropId": "uuid",
  "municipality": "string",
  "state": "string",
  "area": "number",
  "ibgeYield": "number",
  "estimatedProduction": "number",
  "estimatedValue": "number",
  "year": "integer",
  "createdAt": "datetime"
}
```

### 🔐 Authentication

The API uses JWT (JSON Web Token) authentication:

1. **Register/Login**: Get a token through authentication endpoints
2. **Authorization**: Include the token in the `Authorization: Bearer <token>` header
3. **Test in Swagger**: Use the "Authorize" button in the Swagger interface

### 🚀 How to Use

1. **Access documentation**: http://localhost:3000/api-docs
2. **Explore endpoints**: Navigate through categories in the left panel
3. **Test APIs**: Click "Try it out" to test any endpoint
4. **Authenticate**: Use the "Authorize" button for protected endpoints

### 📝 Usage Examples

#### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_farmer",
    "email": "john@farm.com",
    "password": "password123",
    "confirmPassword": "password123",
    "firstName": "John",
    "lastName": "Smith",
    "role": "farmer"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@farm.com",
    "password": "password123"
  }'
```

#### 3. List crops
```bash
curl -X GET http://localhost:3000/api/crops
```

### 🎯 Benefits

- **Automatic Documentation**: Always up-to-date with code
- **Integrated Testing**: Test APIs without external tools
- **OpenAPI Standard**: Compatible with development tools
- **Validation**: Clear input and output specifications
- **Collaboration**: Facilitates team work

### 🔄 Updates

Documentation is automatically generated from JSDoc comments in the code. To add new endpoints:

1. Add JSDoc comments in the `server/routes.ts` file
2. Or add documentation in the `swagger.docs.js` file
3. Restart the server to apply changes

---

**Developed with ❤️ for AgriScienceCrop**
