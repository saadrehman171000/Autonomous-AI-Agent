# Autonomous AI Agent

A full-stack AI-powered Twitter bot dashboard built with Node.js, TypeScript, React, Chakra UI, and Vite. This project enables autonomous interaction with Twitter, including replying to mentions, processing $BTB tweets, and providing a modern web dashboard for monitoring and management.

---

## 🚀 Features
- **Autonomous Twitter Bot**: Replies to mentions and processes $BTB tweets using LLMs (via OpenRouter).
- **Modern Dashboard**: Real-time stats, activity feed, and performance metrics with a beautiful UI (React + Chakra UI).
- **Knowledge Base**: Manage and query a knowledge base for smarter bot responses.
- **Manual Testing**: Test bot replies and LLM requests directly from the dashboard.
- **Logs & Settings**: View logs and configure bot settings from the web UI.

---

## 🗂️ Project Structure
```
Autonomous-AI-Agent/
├── src/                # Backend (Node.js, TypeScript)
│   ├── config/         # Configuration files
│   ├── services/       # Core bot and API services
│   ├── tests/          # Backend tests
│   ├── types/          # Shared types
│   └── utils/          # Utility functions
├── ui/                 # Frontend (React, Vite, Chakra UI)
│   ├── public/         # Static assets (favicon, logo)
│   ├── src/            # React app source code
│   └── index.html      # Main HTML entry
├── package.json        # Backend dependencies & scripts
├── LICENSE             # License file
└── README.md           # Project documentation
```

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/saadrehman171000/Autonomous-AI-Agent.git
cd Autonomous-AI-Agent
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ui
npm install
cd ..
```

---

## 🔑 Configuration
- Edit `src/config/config.ts` to set up your Twitter API keys, OpenRouter API key, and other environment variables.
- Make sure your backend is configured to listen on the correct port (default: 3001).

---

## 🏃 Running the App

### 1. Start the Backend
```bash
npm run start
```

### 2. Start the Frontend (in a new terminal)
```bash
cd ui
npm run dev
```
- The dashboard will be available at `http://localhost:5173` (default Vite port).

---

## 🧩 Usage
- **Dashboard**: View bot status, stats, and recent activity.
- **Live Feed**: Monitor real-time Twitter activity.
- **Manual Test**: Send test prompts and see bot responses.
- **Knowledge Base**: Manage and search knowledge entries.
- **Logs**: View backend logs and errors.
- **Settings**: Configure bot options.

---

## 🧑‍💻 Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to your fork: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License.

---

## 🙏 Credits
- [Chakra UI](https://chakra-ui.com/)
- [Vite](https://vitejs.dev/)
- [OpenRouter](https://openrouter.ai/)
- [SVG Repo](https://www.svgrepo.com/) (for the robot favicon)

---

> **Made with ❤️ for autonomous AI and Twitter automation!**
