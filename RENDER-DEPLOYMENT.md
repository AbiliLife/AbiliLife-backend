
### 1. Backend Deployment on Render (Complete Guide)

#### Step 1: Prepare Your Repository

1. **Push to GitHub** (if not already done)
   ```bash
   # Navigate to your project root
   cd AbiliLife-backend/
   
   # Add all changes
   git add .
   git commit -m "Production ready backend with Firebase and authentication"
   git push origin main
   ```

2. **Verify Backend Structure**
   - Ensure `AbiliLife-backend` folder contains:
     - `package.json` with production scripts
     - `Procfile` with deployment commands
     - `src/` folder with TypeScript source code
     - `.env.example` file

#### Step 2: Create Render Account & Service

1. **Sign up/Login to Render**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub account (recommended for easy repo access)

2. **Create New Web Service**
   - Click "New +" button in Render dashboard
   - Select "Web Service"
   - Choose "Build and deploy from a Git repository"

3. **Connect Repository**
   - Select your GitHub account
   - Find and select `AbiliLife-backend` repository
   - Click "Connect"

#### Step 3: Configure Service Settings

1. **Basic Configuration**
   ```
   Name: abililife-backend-api
   Region: Oregon (US West) or your preferred region
   Branch: main
   Root Directory: abililife-backend-project
   ```

2. **Runtime Configuration**
   ```
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Instance Type**
   ```
   Free Tier: Free (512 MB RAM, shared CPU)
   Paid Tier: Starter ($7/month, 512 MB RAM, 0.1 CPU)
   ```

#### Step 4: Set Environment Variables

In Render dashboard, go to Environment tab and add:

```bash
# Required Variables
NODE_ENV=production
PORT=10000
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account

# Optional Variables
CORS_ORIGIN=*
BCRYPT_SALT_ROUNDS=12
```

**🔑 Getting Your Firebase Base64:**
```powershell
# In your backend directory
cd C:\Users\User\Desktop\AbiliLife-backend
[Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-service-account.json"))
```

#### Step 5: Deploy & Monitor

1. **Deploy Service**
   - Click "Create Web Service"
   - Render will automatically start building and deploying
   - Monitor build logs in real-time

2. **Verify Deployment**
   - Once deployed, your service URL will be: `https://abililife-backend-api.onrender.com`
   - Test health endpoint: `https://your-service-url.onrender.com/health`

#### Step 6: Test Your Deployed Backend

```bash
# Test health endpoint
curl https://your-service-url.onrender.com/health

# Expected response:
{
  "status": "OK",
  "message": "AbiliLife Backend is running",
  "timestamp": "2025-09-01T...",
  "environment": "production",
  "firebase": {
    "status": "connected",
    "projectId": "your-project-id"
  }
}

# Test authentication endpoint
curl -X POST https://your-service-url.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "+1234567890"
  }'
```