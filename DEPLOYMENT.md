# Farm2Market AI — Production Deployment Guide
**Smart India Hackathon 2026 | Problem Statement ID 26033**
*Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution*

---

## 🌟 Deployment Architecture

Farm2Market AI is built with a **Universal Full-Stack Architecture**:
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide + Recharts (compiled to static SPA in `frontend/dist`).
- **Backend**: Express + TypeScript + Prisma ORM + PostgreSQL / PostGIS + Google Gemini Vision API + SerpApi KVK Integration.
- **Production Mode**: When running in production, Express serves the static React SPA directly on the root port (`/`), routing client-side navigation seamlessly and serving REST endpoints under `/api/*`.
- **Zero-CORS Issue**: Everything runs on a single origin, eliminating cross-origin errors.

---

## 🚀 Option 1: 1-Click Cloud Deployment on Render (Free Tier)

Render supports automated fullstack deployments using the included `render.yaml` blueprint:

1. Push your code to GitHub / GitLab.
2. Log in to [Render.com](https://render.com).
3. Click **New +** ➔ **Blueprint**.
4. Connect your repository.
5. Render will automatically detect `render.yaml` and provision:
   - **Web Service**: `farm2market-ai` (runs `npm run build` and `node dist/index.js`).
   - **Managed Database**: `farm2market-db` (PostgreSQL).
6. Under Environment Variables in the Render dashboard, add your API keys:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini key)*
   - `SERP_API_KEY`: *(Optional: Your SerpApi key for KVK and live mandis)*
7. Click **Apply**.
8. Once deployed, run the seed script to populate the 140 core entities:
   - In Render Web Service Shell:
     ```bash
     cd backend
     npx prisma db push
     node scripts/buildDirectory.js
     ```

---

## 🐳 Option 2: Containerized Deployment (Docker & Docker Compose)

Deploy anywhere (local machine, AWS EC2, DigitalOcean Droplet, Linode, Google Compute Engine) with 1 command:

### Prerequisites
- Docker Engine & Docker Compose installed.

### Steps
1. Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SERP_API_KEY=your_serp_api_key_here
   ```

2. Build and start containers:
   ```bash
   docker-compose up --build -d
   ```

3. The platform will be live at:
   - **Web App & APIs**: `http://localhost:5000`
   - **PostgreSQL + PostGIS**: `localhost:5432`

4. Seed the database inside the container:
   ```bash
   docker exec -it farm2market-app node scripts/buildDirectory.js
   ```

5. To stop:
   ```bash
   docker-compose down
   ```

---

## 🚂 Option 3: Deploy on Railway

1. Install Railway CLI or connect via [Railway.app](https://railway.app).
2. Click **New Project** ➔ **Provision PostgreSQL**.
3. Add a new service from your GitHub repository.
4. Set Build Command:
   ```bash
   npm install && npm run build
   ```
5. Set Start Command:
   ```bash
   node backend/dist/index.js
   ```
6. Add Environment Variables:
   - `DATABASE_URL`: Railway Postgres connection string.
   - `JWT_SECRET`: Any strong secret string.
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `PORT`: `5000` (or leave default assigned by Railway).

---

## ☁️ Option 4: Linux VPS Deployment (Ubuntu / Debian with PM2)

For deploying on a virtual private server (e.g. AWS Lightsail, DigitalOcean, Hetzner, Hostinger):

1. **Install Node.js 20 & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url> /var/www/farm2market
   cd /var/www/farm2market
   npm install
   npm run build
   ```

3. **Configure Environment Variables**:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env
   ```

4. **Initialize Database**:
   ```bash
   cd backend
   npx prisma db push
   node scripts/buildDirectory.js
   cd ..
   ```

5. **Start with PM2**:
   ```bash
   pm2 start backend/dist/index.js --name "farm2market-ai"
   pm2 save
   pm2 startup
   ```

6. **Optional: Setup Nginx Reverse Proxy with SSL (Certbot)**:
   ```nginx
   server {
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🔑 Environment Variables Reference

| Variable Name | Required | Default / Description |
| :--- | :--- | :--- |
| `PORT` | Optional | `5000` (Port on which Express listens) |
| `NODE_ENV` | Recommended | `production` |
| `DATABASE_URL` | **Required** | PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`) or SQLite (`file:./dev.db`) |
| `JWT_SECRET` | **Required** | Secure 32+ character string for JWT authentication tokens |
| `GEMINI_API_KEY` | **Required** | Google AI Studio Gemini API Key for optical produce quality scanning |
| `SERP_API_KEY` | Optional | SerpApi Key for live KVK center geolocation and APMC web search |

---

## 🌾 Default Seed Accounts for Production Verification

| Role | Username / Email | Password | Entity Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `fam1` / `farmer@123` | `farmer@123` | Pranav, Chandur Railway, Amravati (Cotton & Soybean) |
| **Buyer** | `byer1` / `byer123` | `byer123` | Rohit Agarwal, Maharashtra Agro Traders (Amravati & Nagpur) |
| **FPO** | `fpo1` / `fpo123` | `fpo123` | Sahyadri Farmer Producer Co., Nashik |
| **Admin** | `admin1` / `admin123` | `admin123` | DoCA National Operations Monitoring Cell |
