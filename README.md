# Zesty Dashboard

The Lobster Control Center - A real-time monitoring and management interface for the Zesty ecosystem.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3.3-38bdf8)

## Features

- **Real-time Health Monitoring**: Track system status and alerts from heartbeat state
- **Moltbook Karma Display**: Live karma tracking with trend visualization
- **Quest Progress Tracking**: Monitor active quests and completion status
- **Collection Book**: Display collected stickers and achievements
- **Live Signal Stream**: Real-time system logs and event monitoring
- **Responsive Design**: Mobile-friendly with sidebar navigation
- **Modern UI**: Built with React, Tailwind CSS, and Lucide icons

## Tech Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.3
- **Icons**: Lucide React
- **Build Tool**: Vite 4.4.5
- **Data**: Fetch from OpenClaw memory files (quests.json, heartbeat-state.json)

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server with mock API:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`
The mock API server will run on `http://localhost:8080`

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Access the dashboard at `http://localhost:3000`

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── HealthStatusCard.jsx    # System health monitoring
│   │   ├── KarmaCard.jsx           # Moltbook karma display
│   │   ├── QuestStatsCard.jsx      # Quest progress tracker
│   │   ├── CollectionBookCard.jsx  # Sticker collection
│   │   └── SystemLogsCard.jsx      # Live event stream
│   ├── utils/
│   │   └── dataService.js          # Data fetching service
│   ├── Dashboard.jsx               # Main dashboard component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── mock-server.js                  # Mock API server for development
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Docker Compose setup
└── package.json
```

## Data Sources

The dashboard reads from the following OpenClaw memory files:

- **Quest Stats**: `/memory/quests.json`
- **Health Status**: `/memory/heartbeat-state.json`
- **Moltbook Karma**: From heartbeat state (last_moltbook_karma)
- **Stickers**: `/workspace/media/stickers/` directory

## Features in Detail

### Health Status Card
- Displays system health status (Optimal/Attention Needed)
- Shows last heartbeat check time
- Lists recent security alerts
- Updates every 30 seconds

### Karma Card
- Live Moltbook karma display
- Trend visualization (up/down/flat)
- Progress bar towards next level
- Updates every 10 seconds

### Quest Stats Card
- Active quests with progress tracking
- Stage-by-stage completion status
- Completed quests counter
- Updates every 20 seconds

### Collection Book
- Grid view of collected stickers
- Sticker detail modal on click
- Rarity indicators
- Future slots locked

### System Logs
- Real-time event stream
- Color-coded by type (info/success/warning/error)
- Live monitoring indicator
- Auto-refresh every 5 seconds

## Development Notes

- The mock server (`mock-server.js`) provides API endpoints that read from local files
- Vite proxy configuration routes `/api` requests to the mock server
- In production, you would replace the mock server with actual API endpoints
- Components use React hooks for state management and data fetching
- All data fetching includes error handling and fallbacks

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] User authentication and authorization
- [ ] Customizable dashboard layouts
- [ ] Export/quest progress reports
- [ ] Mobile app version
- [ ] Integration with Moltbook API directly
- [ ] Notification system for quest updates
- [ ] Achievement unlocking animations

## License

Licensed under the MIT License - see LICENSE file for details

## Quest Status

**Quest #9**: Zesty Dashboard - The Lobster Control Center
- ✅ UI/UX Design (React + Tailwind + lucide-react)
- ✅ Backend/Connectors (Zesty Health, Karma, Quest Stats)
- ✅ Collection Book Integration (Stickers & Trophies)
- ✅ Dockerization (Dockerfile & Docker Compose)
- 🔄 Deployment & Verification (In Progress)

Built with 🦞 by the Zesty Team