# KASEP Backend API Documentation

This is the complete REST API documentation for the KASEP (Kalori Sehat dan Praktis) backend application.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. User Profile Endpoints

### Get Current User Profile
- **GET** `/user/profile`
- **Auth Required**: Yes
- **Description**: Get current authenticated user's profile

### Update Current User Profile  
- **PUT** `/user/profile`
- **Auth Required**: Yes
- **Body**:
```json
{
  "userAlias": "string",
  "username": "string", 
  "firstName": "string",
  "lastName": "string",
  "birthDate": "2023-01-01",
  "gender": "male|female",
  "height": 170,
  "weight": 70,
  "activityLevel": "sedentary|light|moderate|active|very_active"
}
```

### Get All Users (Admin)
- **GET** `/users?page=1&limit=10`
- **Auth Required**: No
- **Query Parameters**: `page`, `limit`

### Get User by ID
- **GET** `/users/{id}`
- **Auth Required**: No

### Delete User by ID
- **DELETE** `/users/{id}`
- **Auth Required**: No

---

## 2. BMI Record Endpoints

### Create BMI Record
- **POST** `/bmi`
- **Auth Required**: Yes
- **Body**:
```json
{
  "date": "2023-01-01",
  "height": 170,
  "weight": 70,
  "age": 25,
  "activityLevel": "moderate",
  "bmi": 24.22,
  "category": "Normal",
  "healthStatus": "Healthy",
  "targetCalories": 2000,
  "hasGoals": true
}
```

### Get Current User's BMI Records
- **GET** `/bmi/my-records?page=1&limit=10`
- **Auth Required**: Yes
- **Query Parameters**: `page`, `limit`

### Get All BMI Records (Admin)
- **GET** `/bmi?page=1&limit=10&userId={userId}`
- **Auth Required**: No
- **Query Parameters**: `page`, `limit`, `userId`

### Get BMI Record by ID
- **GET** `/bmi/{id}`
- **Auth Required**: No

### Update BMI Record
- **PUT** `/bmi/{id}`
- **Auth Required**: No
- **Body**: Same as create, all fields optional

### Delete BMI Record
- **DELETE** `/bmi/{id}`
- **Auth Required**: No

---

## 3. Receipt (Resep) Endpoints

### Create Receipt
- **POST** `/receipts`
- **Auth Required**: No
- **Body**:
```json
{
  "judul": "Nasi Goreng Sehat",
  "gambar": "https://example.com/image.jpg",
  "deskripsi": "Resep nasi goreng sehat",
  "labelBahan": ["beras", "telur", "sayuran"],
  "metodeMemasak": ["tumis", "goreng"],
  "kalori": 350.5,
  "protein": 15.2,
  "lemak": 8.5,
  "karbohidrat": 45.0,
  "ingredients": [
    {"bahan": "Beras 200g"},
    {"bahan": "Telur 2 butir"}
  ],
  "steps": [
    {
      "description": "Masak nasi terlebih dahulu",
      "images": [{"url": "https://example.com/step1.jpg"}]
    }
  ]
}
```

### Get All Receipts
- **GET** `/receipts?page=1&limit=10&search=nasi`
- **Auth Required**: No
- **Query Parameters**: `page`, `limit`, `search`

### Get Receipt by ID
- **GET** `/receipts/{id}`
- **Auth Required**: No

### Update Receipt
- **PUT** `/receipts/{id}`
- **Auth Required**: No
- **Body**: Same as create, all fields optional

### Delete Receipt
- **DELETE** `/receipts/{id}`
- **Auth Required**: No

---

## 4. History Endpoints

### Create History
- **POST** `/history`
- **Auth Required**: Yes
- **Body**:
```json
{
  "receiptId": "uuid",
  "detectedLabels": ["beras", "telur", "sayuran"],
  "photoUrl": "https://example.com/photo.jpg",
  "category": "Sarapan",
  "notes": "Enak sekali",
  "bahanUtama": ["beras", "telur"],
  "bahanKurang": ["sayuran"]
}
```

### Get Current User's History
- **GET** `/history/my-history?page=1&limit=10&category=Sarapan`
- **Auth Required**: Yes
- **Query Parameters**: `page`, `limit`, `category`

### Get All History (Admin)
- **GET** `/history?page=1&limit=10&userId={userId}&receiptId={receiptId}&category=Sarapan`
- **Auth Required**: No
- **Query Parameters**: `page`, `limit`, `userId`, `receiptId`, `category`

### Get History by ID
- **GET** `/history/{id}`
- **Auth Required**: No

### Update History
- **PUT** `/history/{id}`
- **Auth Required**: No
- **Body**: Same as create, all fields optional

### Delete History
- **DELETE** `/history/{id}`
- **Auth Required**: No

---

## 5. Ideal Targets Endpoints

### Create Ideal Targets
- **POST** `/ideal-targets`
- **Auth Required**: No
- **Body**:
```json
{
  "bmiRecordId": "uuid",
  "weightRange": "65-70 kg",
  "targetWeight": 68,
  "targetBMI": "22.5-24.9",
  "targetCalories": 1800,
  "timeEstimate": "3-6 bulan"
}
```

### Get All Ideal Targets
- **GET** `/ideal-targets?page=1&limit=10`
- **Auth Required**: No
- **Query Parameters**: `page`, `limit`

### Get Ideal Targets by ID
- **GET** `/ideal-targets/{id}`
- **Auth Required**: No

### Get Ideal Targets by BMI Record
- **GET** `/ideal-targets/bmi/{bmiRecordId}`
- **Auth Required**: No

### Update Ideal Targets
- **PUT** `/ideal-targets/{id}`
- **Auth Required**: No
- **Body**: Same as create, all fields optional

### Delete Ideal Targets
- **DELETE** `/ideal-targets/{id}`
- **Auth Required**: No

---

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error|fail",
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## Status Codes

- **200**: OK - Request successful
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid request data
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

---

## Models Schema

### UserProfile
```typescript
{
  id: string (uuid)
  userAlias: string (unique)
  email: string (unique)
  username: string (unique)
  password?: string
  firstName: string
  lastName: string
  birthDate?: Date
  gender?: "male" | "female"
  height?: number
  weight?: number
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active"
  authProvider: "local" | "google" | "facebook"
  providerId?: string
  createdAt: Date
  updatedAt: Date
}
```

### BMIRecord
```typescript
{
  id: string (uuid)
  date: Date
  height: number
  weight: number
  age: number
  activityLevel: ActivityLevel
  bmi: number
  category: string
  healthStatus: string
  targetCalories: number
  hasGoals: boolean
  userId: string
}
```

### Receipt
```typescript
{
  id: string (uuid)
  judul: string (unique)
  gambar: string
  deskripsi?: string
  labelBahan: string (JSON)
  metodeMemasak: string (JSON)
  kalori: number
  protein?: number
  lemak?: number
  karbohidrat?: number
  createdAt: Date
  updatedAt: Date
}
```

### History
```typescript
{
  id: string (uuid)
  userId: string
  receiptId: string
  detectedLabels: string (JSON)
  photoUrl?: string
  selectedAt: Date
  category?: string
  notes?: string
  bahanUtama?: string (JSON)
  bahanKurang?: string (JSON)
}
```

### IdealTargets
```typescript
{
  id: string (uuid)
  weightRange: string
  targetWeight: number
  targetBMI: string
  targetCalories: number
  timeEstimate: string
  bmiRecordId: string (unique)
}
```

---

## Notes

1. **Authentication**: Endpoints marked with "Auth Required: Yes" need JWT token in Authorization header
2. **Pagination**: Most list endpoints support pagination with `page` and `limit` query parameters
3. **JSON Fields**: Some fields store JSON data as strings (labelBahan, metodeMemasak, detectedLabels, etc.)
4. **File Uploads**: Image uploads can be handled via `/uploads/{file*}` endpoint
5. **CORS**: API supports CORS for cross-origin requests
6. **Database**: Uses PostgreSQL with Prisma ORM
7. **Validation**: All endpoints have input validation using Joi schema 