# CURL Testing Examples for KASEP API

This file contains curl commands to test all the CRUD endpoints in the KASEP backend API.

**Base URL:** `http://localhost:3000`

---

## 🔧 **Setup Variables**
```bash
# Set base URL
export BASE_URL="http://localhost:3000"

# You'll need to get a JWT token from login first
export JWT_TOKEN="your_jwt_token_here"
```

---

## 🏠 **Health Check**

### Get API Info
```bash
curl -X GET "$BASE_URL/"
```

---

## 👤 **1. User Profile Endpoints**

### Get Current User Profile (Authenticated)
```bash
curl -X GET "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Update Current User Profile (Authenticated)
```bash
curl -X PUT "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userAlias": "john_doe_updated",
    "username": "johndoe123",
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1995-05-15",
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activityLevel": "moderate"
  }'
```

### Get All Users (Admin)
```bash
curl -X GET "$BASE_URL/users?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get User by ID
```bash
# Replace {user_id} with actual UUID
curl -X GET "$BASE_URL/users/{user_id}" \
  -H "Content-Type: application/json"
```

### Delete User by ID
```bash
# Replace {user_id} with actual UUID
curl -X DELETE "$BASE_URL/users/{user_id}" \
  -H "Content-Type: application/json"
```

---

## 📊 **2. BMI Record Endpoints**

### Create BMI Record (Authenticated)
```bash
curl -X POST "$BASE_URL/bmi" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-12-01",
    "height": 175,
    "weight": 70,
    "age": 28,
    "activityLevel": "moderate",
    "bmi": 22.86,
    "category": "Normal",
    "healthStatus": "Healthy",
    "targetCalories": 2200,
    "hasGoals": true
  }'
```

### Get Current User BMI Records (Authenticated)
```bash
curl -X GET "$BASE_URL/bmi/my-records?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get All BMI Records (Admin)
```bash
curl -X GET "$BASE_URL/bmi?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get BMI Records by User ID
```bash
# Replace {user_id} with actual UUID
curl -X GET "$BASE_URL/bmi?userId={user_id}&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get BMI Record by ID
```bash
# Replace {bmi_id} with actual UUID
curl -X GET "$BASE_URL/bmi/{bmi_id}" \
  -H "Content-Type: application/json"
```

### Update BMI Record
```bash
# Replace {bmi_id} with actual UUID
curl -X PUT "$BASE_URL/bmi/{bmi_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 72,
    "bmi": 23.51,
    "targetCalories": 2300,
    "hasGoals": true
  }'
```

### Delete BMI Record
```bash
# Replace {bmi_id} with actual UUID
curl -X DELETE "$BASE_URL/bmi/{bmi_id}" \
  -H "Content-Type: application/json"
```

---

## 🍳 **3. Receipt (Resep) Endpoints**

### Create Receipt
```bash
curl -X POST "$BASE_URL/receipts" \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "Nasi Goreng Sehat",
    "gambar": "https://example.com/nasi-goreng.jpg",
    "deskripsi": "Resep nasi goreng sehat dengan sayuran segar",
    "labelBahan": ["beras", "telur", "wortel", "kacang polong", "bawang"],
    "metodeMemasak": ["tumis", "goreng", "campur"],
    "kalori": 350.5,
    "protein": 15.2,
    "lemak": 8.5,
    "karbohidrat": 45.0,
    "ingredients": [
      {"bahan": "Beras putih 200g"},
      {"bahan": "Telur ayam 2 butir"},
      {"bahan": "Wortel 100g"},
      {"bahan": "Kacang polong 50g"},
      {"bahan": "Bawang putih 3 siung"}
    ],
    "steps": [
      {
        "description": "Masak nasi putih hingga matang dan dinginkan",
        "images": [{"url": "https://example.com/step1.jpg"}]
      },
      {
        "description": "Tumis bawang putih hingga harum",
        "images": [{"url": "https://example.com/step2.jpg"}]
      },
      {
        "description": "Masukkan telur, orak-arik hingga matang",
        "images": [{"url": "https://example.com/step3.jpg"}]
      }
    ]
  }'
```

### Get All Receipts
```bash
curl -X GET "$BASE_URL/receipts?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Search Receipts
```bash
curl -X GET "$BASE_URL/receipts?search=nasi&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get Receipt by ID
```bash
# Replace {receipt_id} with actual UUID
curl -X GET "$BASE_URL/receipts/{receipt_id}" \
  -H "Content-Type: application/json"
```

### Update Receipt
```bash
# Replace {receipt_id} with actual UUID
curl -X PUT "$BASE_URL/receipts/{receipt_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "deskripsi": "Resep nasi goreng sehat dengan sayuran segar - Updated",
    "kalori": 360.0,
    "protein": 16.0
  }'
```

### Delete Receipt
```bash
# Replace {receipt_id} with actual UUID
curl -X DELETE "$BASE_URL/receipts/{receipt_id}" \
  -H "Content-Type: application/json"
```

---

## 📝 **4. History Endpoints**

### Create History (Authenticated)
```bash
curl -X POST "$BASE_URL/history" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiptId": "receipt_uuid_here",
    "detectedLabels": ["beras", "telur", "wortel", "kacang polong"],
    "photoUrl": "https://example.com/user-photo.jpg",
    "category": "Sarapan",
    "notes": "Rasanya enak, mudah dibuat",
    "bahanUtama": ["beras", "telur"],
    "bahanKurang": ["kacang polong"]
  }'
```

### Get Current User History (Authenticated)
```bash
curl -X GET "$BASE_URL/history/my-history?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get User History by Category (Authenticated)
```bash
curl -X GET "$BASE_URL/history/my-history?category=Sarapan&page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Get All History (Admin)
```bash
curl -X GET "$BASE_URL/history?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get History by User ID (Admin)
```bash
# Replace {user_id} with actual UUID
curl -X GET "$BASE_URL/history?userId={user_id}&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get History by Receipt ID
```bash
# Replace {receipt_id} with actual UUID
curl -X GET "$BASE_URL/history?receiptId={receipt_id}&page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get History by ID
```bash
# Replace {history_id} with actual UUID
curl -X GET "$BASE_URL/history/{history_id}" \
  -H "Content-Type: application/json"
```

### Update History
```bash
# Replace {history_id} with actual UUID
curl -X PUT "$BASE_URL/history/{history_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Makan Siang",
    "notes": "Rasanya enak, mudah dibuat - Updated",
    "bahanKurang": []
  }'
```

### Delete History
```bash
# Replace {history_id} with actual UUID
curl -X DELETE "$BASE_URL/history/{history_id}" \
  -H "Content-Type: application/json"
```

---

## 🎯 **5. Ideal Targets Endpoints**

### Create Ideal Targets
```bash
curl -X POST "$BASE_URL/ideal-targets" \
  -H "Content-Type: application/json" \
  -d '{
    "bmiRecordId": "bmi_record_uuid_here",
    "weightRange": "65-70 kg",
    "targetWeight": 68,
    "targetBMI": "22.5-24.9",
    "targetCalories": 1800,
    "timeEstimate": "3-6 bulan"
  }'
```

### Get All Ideal Targets
```bash
curl -X GET "$BASE_URL/ideal-targets?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Get Ideal Targets by ID
```bash
# Replace {ideal_targets_id} with actual UUID
curl -X GET "$BASE_URL/ideal-targets/{ideal_targets_id}" \
  -H "Content-Type: application/json"
```

### Get Ideal Targets by BMI Record ID
```bash
# Replace {bmi_record_id} with actual UUID
curl -X GET "$BASE_URL/ideal-targets/bmi/{bmi_record_id}" \
  -H "Content-Type: application/json"
```

### Update Ideal Targets
```bash
# Replace {ideal_targets_id} with actual UUID
curl -X PUT "$BASE_URL/ideal-targets/{ideal_targets_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "targetWeight": 67,
    "targetCalories": 1750,
    "timeEstimate": "4-7 bulan"
  }'
```

### Delete Ideal Targets
```bash
# Replace {ideal_targets_id} with actual UUID
curl -X DELETE "$BASE_URL/ideal-targets/{ideal_targets_id}" \
  -H "Content-Type: application/json"
```

---

## 🧪 **Testing Workflow Examples**

### Complete User Journey Test
```bash
# 1. Check API health
curl -X GET "$BASE_URL/"

# 2. Get all receipts
curl -X GET "$BASE_URL/receipts?page=1&limit=5"

# 3. Get specific receipt
RECEIPT_ID="get_id_from_step2"
curl -X GET "$BASE_URL/receipts/$RECEIPT_ID"

# 4. Create BMI record (need authentication)
curl -X POST "$BASE_URL/bmi" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-12-01",
    "height": 175,
    "weight": 70,
    "age": 28,
    "activityLevel": "moderate",
    "bmi": 22.86,
    "category": "Normal",
    "healthStatus": "Healthy",
    "targetCalories": 2200,
    "hasGoals": true
  }'

# 5. Create history for the recipe (need authentication)
curl -X POST "$BASE_URL/history" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiptId": "'$RECEIPT_ID'",
    "detectedLabels": ["beras", "telur", "wortel"],
    "category": "Sarapan",
    "notes": "Testing recipe"
  }'
```

### Pagination Testing
```bash
# Test pagination with different limits
curl -X GET "$BASE_URL/receipts?page=1&limit=2"
curl -X GET "$BASE_URL/receipts?page=2&limit=2"
curl -X GET "$BASE_URL/receipts?page=1&limit=5"
```

### Search Testing
```bash
# Test search functionality
curl -X GET "$BASE_URL/receipts?search=nasi"
curl -X GET "$BASE_URL/receipts?search=goreng"
curl -X GET "$BASE_URL/receipts?search=sehat"
```

---

## 🚨 **Error Testing Examples**

### Test Invalid UUID
```bash
curl -X GET "$BASE_URL/receipts/invalid-uuid" \
  -H "Content-Type: application/json"
```

### Test Unauthorized Access
```bash
curl -X GET "$BASE_URL/user/profile" \
  -H "Content-Type: application/json"
```

### Test Invalid Data
```bash
curl -X POST "$BASE_URL/bmi" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "invalid-date",
    "height": -1,
    "weight": 0
  }'
```

---

## 📝 **Notes**

1. **Replace Placeholders**: Replace `{user_id}`, `{bmi_id}`, etc. with actual UUIDs from your database
2. **JWT Token**: Get a valid JWT token from your authentication endpoint first
3. **Base URL**: Make sure your server is running on `http://localhost:3000`
4. **JSON Format**: All requests use `application/json` content type
5. **Error Handling**: Each endpoint returns proper HTTP status codes and error messages

---

## 🔧 **Useful Shell Functions**

Add these to your `.bashrc` or `.zshrc` for easier testing:

```bash
# Function to test API endpoints easily
kasep_test() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -X $method "http://localhost:3000$endpoint" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $JWT_TOKEN"
    else
        curl -X $method "http://localhost:3000$endpoint" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $JWT_TOKEN" \
             -d "$data"
    fi
}

# Usage examples:
# kasep_test GET "/receipts"
# kasep_test POST "/bmi" '{"date":"2023-12-01","height":175,"weight":70,...}'
``` 