# AbiliLife Backend API 🚀

The backend API for the AbiliLife super app, built with Node.js, Express, TypeScript, and Firebase.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase (for future features)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (instructions below)

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd AbiliLife-backend
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication and Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate a new private key and download the JSON file
6. Save it as `firebase-service-account.json` in the project root

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

### 4. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

This project includes **Swagger/OpenAPI documentation** for all API endpoints.

### Accessing the Documentation

1. **Start the server**: `npm run dev` or `npm run docs`
2. **Open your browser** and navigate to: `http://localhost:3000/api-docs`

The Swagger UI provides interactive documentation with request/response examples, schema definitions, and try-it-out functionality.

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/send-otp` | Send OTP to phone |
| POST | `/api/v1/auth/verify-otp` | Verify phone OTP |
| GET | `/api/v1/auth/profile/:userId` | Get user profile |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## 📝 API Usage Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+254712345678",
    "fullName": "John Doe",
    "password": "securepassword123"
  }'
```

### Login User

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

## 🏗 Project Structure

```text
src/
├── config/
│   ├── firebase.ts          # Firebase configuration
│   └── swagger.ts           # API documentation config
├── controllers/
│   └── AuthController.ts    # Authentication logic
├── middleware/
│   └── errorHandler.ts      # Error handling
├── models/
│   └── User.ts             # User data models
├── routes/
│   └── auth.ts             # Authentication routes
├── services/
│   └── AuthService.ts      # Business logic
└── index.ts                # Main server file
```

## 🔧 Development

### Adding New Features

1. **Models**: Define data structures in `src/models/`
2. **Services**: Implement business logic in `src/services/`
3. **Controllers**: Handle HTTP requests in `src/controllers/`
4. **Routes**: Define API endpoints in `src/routes/`
5. **Middleware**: Add middleware in `src/middleware/`

### Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## 🔮 Future Enhancements

- [ ] JWT-based authentication middleware
- [ ] Rate limiting for API endpoints
- [ ] SMS integration for real OTP sending
- [ ] Mobility service endpoints (rides, routes)
- [ ] Real-time features with WebSockets
- [ ] Integration with local transport APIs
- [ ] Mobile money (M-Pesa) integration
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0.
