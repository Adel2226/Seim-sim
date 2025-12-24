# 📦 JobSim SIEM Pro Advanced - Complete Source Code

## 📥 Downloaded Files

You have successfully downloaded the complete source code for **JobSim SIEM Pro Advanced v2.5**.

### Package Contents:

```
jobsim-complete-source.tar.gz (264 KB)
├── backend/                      # FastAPI Backend
│   ├── server.py                 # Main API server
│   ├── models.py                 # Data models
│   ├── simulation_engine.py      # Simulation logic
│   ├── ai_assistant.py           # AI Assistant
│   ├── advanced_features.py      # Advanced features
│   ├── realtime_events.py        # Real-time events
│   ├── timeline_manager.py       # Timeline management
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/          # 15+ React components
│   │   │   ├── SimulationDashboard.js
│   │   │   ├── ScenarioSelection.js
│   │   │   ├── AlertsPanel.js
│   │   │   ├── InvestigationPanel.js
│   │   │   ├── CommandInterface.js
│   │   │   ├── MetricsPanel.js
│   │   │   ├── EvaluationModal.js
│   │   │   ├── NotificationSystem.js
│   │   │   ├── TimelinePanel.js
│   │   │   ├── TeamMessagesPanel.js
│   │   │   ├── AchievementsDisplay.js
│   │   │   ├── AIAssistantPanel.js
│   │   │   ├── AttackMapVisualization.js
│   │   │   ├── LiveMetricsChart.js
│   │   │   └── [All CSS files]
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
└── Documentation/
    ├── README.md                  # User guide
    ├── DEVELOPER_GUIDE.md        # Developer documentation
    └── INTERACTIVE_FEATURES.md   # Interactive features guide
```

---

## 🚀 Installation Instructions

### Prerequisites:
- **Python 3.11+**
- **Node.js 18+** 
- **MongoDB** (local or Atlas)
- **Yarn** package manager

### Step 1: Extract the Archive

```bash
# Extract the downloaded file
tar -xzf jobsim-complete-source.tar.gz
cd jobsim-siem-pro-advanced
```

### Step 2: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file with your settings:
nano .env

# Required variables:
# MONGO_URL=mongodb://localhost:27017/
# DB_NAME=jobsim_db
```

### Step 3: Setup Frontend

```bash
cd ../frontend

# Install dependencies
yarn install

# Configure environment variables
# Edit .env file:
nano .env

# Required variables:
# REACT_APP_BACKEND_URL=http://localhost:8001
```

### Step 4: Run the Application

**Option 1: Using Supervisor (Production)**

```bash
# Install supervisor
sudo apt-get install supervisor  # Ubuntu/Debian
# or
brew install supervisor  # macOS

# Copy supervisor configs
sudo cp configs/supervisor/*.conf /etc/supervisor/conf.d/

# Start services
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

**Option 2: Manual (Development)**

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start Frontend
cd frontend
yarn start

# Terminal 3: Start MongoDB (if local)
mongod --dbpath /path/to/data
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔧 Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

**Option 2: MongoDB Atlas (Cloud)**
```bash
# 1. Create free account at https://www.mongodb.com/cloud/atlas
# 2. Create a cluster
# 3. Get connection string
# 4. Update MONGO_URL in backend/.env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

### Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017/
DB_NAME=jobsim_db
PORT=8001
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📚 Features Overview

### ✨ Core Features:
- ✅ Interactive SIEM Simulation
- ✅ Adaptive Attacker AI
- ✅15+ Security Commands
- ✅ Real-time Notifications
- ✅ AI Assistant with Smart Hints
- ✅ Kill Chain Visualization
- ✅ Achievement System
- ✅ 7 Performance Metrics
- ✅ Timeline Events
- ✅ Team Messaging
- ✅ Sound Effects
- ✅ Ranking System
- ✅ 5 Difficulty Levels

### 🎮 User Experience:
- Arabic Language Support
- Responsive Design
- Professional SOC Interface
- Real-time Updates
- Interactive Graphics
- Sound Effects
- Achievement Popups
- Progress Tracking

---

## 🛠️ Development

### Project Structure:

```
Backend (Python/FastAPI):
├── API Routes (10+ endpoints)
├── Simulation Engine
├── AI Assistant
├── Event Generator
├── Timeline Manager
└── Data Models

Frontend (React):
├── 15+ Components
├── State Management
├── API Integration
├── Animations
├── Sound System
└── Responsive UI
```

### Key Technologies:

**Backend:**
- FastAPI
- MongoDB (Motor)
- Pydantic
- Python 3.11+

**Frontend:**
- React 19
- React Router
- Axios
- CSS3 Animations
- Web Audio API
- Canvas API

---

## 📖 Documentation

### Available Docs:
1. **README.md** - User guide and features overview
2. **DEVELOPER_GUIDE.md** - Technical documentation for developers
3. **INTERACTIVE_FEATURES.md** - Interactive features documentation

### API Documentation:

Once the backend is running, visit:
```
http://localhost:8001/docs
```
For interactive Swagger API documentation.

---

## 🐛 Troubleshooting

### Common Issues:

**1. Port Already in Use:**
```bash
# Change port in backend/server.py
# Or kill process using the port
sudo lsof -ti:8001 | xargs kill -9
```

**2. MongoDB Connection Error:**
```bash
# Check MongoDB is running
sudo systemctl status mongodb

# Check connection string in .env
```

**3. Frontend Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

**4. Missing Dependencies:**
```bash
# Backend
pip install -r requirements.txt --upgrade

# Frontend
yarn install
```

---

## 🔄 Updates and Maintenance

### Updating Dependencies:

**Backend:**
```bash
pip install --upgrade pip
pip install -r requirements.txt --upgrade
pip freeze > requirements.txt
```

**Frontend:**
```bash
yarn upgrade-interactive
```

---

## 📞 Support

### Resources:
- Documentation: See included MD files
- API Docs: http://localhost:8001/docs
- Issues: Check logs in `/var/log/supervisor/`

### Logs Location:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

---

## 📄 License

This project includes:
- Full source code
- Documentation
- Configuration files
- All assets

**Version:** 2.5
**Last Updated:** December 2024

---

## 🎉 You're All Set!

Your complete JobSim SIEM Pro Advanced application is ready to run.

Follow the installation steps above and enjoy your professional SOC training simulator!

For questions or issues, refer to the included documentation files.

**Happy Training! 🚀**
