# KASEP Backend API

Backend REST API untuk aplikasi KASEP (Kalori Resep) yang menggunakan Hapi.js, PostgreSQL, Prisma ORM, dan TensorFlow.js untuk deteksi dan analisis gambar bahan makanan untuk rekomendasi resep.

## 🚀 Fitur

- **Autentikasi & Autorisasi**: JWT-based authentication
- **User Management**: Registrasi, login, profile management
- **ML Prediction**: Analisis gambar bahan makanan menggunakan model TensorFlow
- **Image Processing**: Upload, resize, dan optimasi gambar
- **Health Tips**: Rekomendasi resep sehat
- **Database**: PostgreSQL dengan Prisma ORM

## 🛠️ Teknologi

- **Runtime**: Node.js
- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Machine Learning**: TensorFlow.js
- **Image Processing**: Sharp
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

## 📁 Struktur Project

```
backend-main-app/
├── src/
│   ├── handlers/          # Request handlers
│   │   ├── authHandler.js
│   │   ├── userHandler.js
│   │   ├── predictionHandler.js
│   │   └── healthTipHandler.js
│   ├── routes/            # Route definitions
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── prediction.js
│   │   └── healthTip.js
│   ├── services/          # Business logic
│   │   └── mlService.js
│   ├── utils/             # Utility functions
│   │   ├── jwt.js
│   │   └── upload.js
│   └── server.js          # Main server file
├── prisma/
│   └── schema.prisma      # Database schema
├── uploads/               # Uploaded images
├── models/                # ML model files
├── .env                   # Environment variables
└── package.json
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v18 atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd backend-main-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Update file `.env` dengan konfigurasi database Anda:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/kasep_main_db?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/kasep_main_db"

   # Server
   PORT=3000
   HOST=localhost

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # App
   NODE_ENV=development

   # Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_DIR=uploads

   # ML Model
   MODEL_PATH=./models/model.json
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Atau gunakan migrasi
   npm run db:migrate
   ```

5. **Letakkan model ML**
   
   Letakkan file model TensorFlow.js Anda di folder `models/`:
   - `model.json`
   - `model_weights.bin` (atau file weights lainnya)

## 🚀 Menjalankan Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user baru |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh JWT token |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | ✅ |
| PUT | `/user/profile` | Update user profile | ✅ |

### Prediction (ML)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/predict` | Upload gambar untuk analisis | ✅ |
| GET | `/predictions` | Get user predictions | ✅ |
| GET | `/predictions/{id}` | Get prediction by ID | ✅ |
| DELETE | `/predictions/{id}` | Delete prediction | ✅ |

### Health Tips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health-tips` | Get all health tips |
| GET | `/health-tips/{id}` | Get health tip by ID |
| GET | `/health-tips/categories` | Get tip categories |

### Static Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/uploads/{filename}` | Serve uploaded images |

## 🔒 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Include token di header:

```
Authorization: Bearer <your-jwt-token>
```

## 📸 Upload Gambar

Untuk endpoint prediction, gunakan `multipart/form-data` dengan field `image`:

```javascript
const formData = new FormData();
formData.append('image', imageFile);

fetch('/predict', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## 🗄️ Database Schema

### User
- id (String, Primary Key)
- email (String, Unique)
- fullName (String)
- password (String, Hashed)
- age (Int, Optional)
- calories_now (Float, Optional)
- calories_target (Float, Optional)
- avatar (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Prediction
- id (String, Primary Key)
- userId (String, Foreign Key)
- imageUrl (String)
- result (String)
- confidence (Float)
- suggestions (String, JSON)
- createdAt (DateTime)
- updatedAt (DateTime)

### HealthTip
- id (String, Primary Key)
- title (String)
- content (String)
- category (String)
- imageUrl (String, Optional)
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and apply migration
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `DIRECT_URL` | Direct database connection | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `5242880` (5MB) |
| `UPLOAD_DIR` | Upload directory | `uploads` |
| `MODEL_PATH` | ML model path | `./models/model.json` |

## 📝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC License - see LICENSE file for details.

## 👥 Team

- **Gagas Surya Laksana** - Backend Developer

---

🔗 **Links:**
- [Hapi.js Documentation](https://hapi.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)

