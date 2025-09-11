# 🌉 Welland Canal Bridge Status Visualizer  
## 📋 Project Overview  
This project provides a real-time visualization of the Welland Canal bridge statuses using live data scraped from the official Seaway website.

For many local commuters (myself included), lift bridges often cause frustrating delays — getting stuck waiting for one to lower can make you late for work, school, or appointments. Instead of refreshing text-heavy pages or guessing, this tool offers a fast, map-based way to check bridge status in real time.

It also improves accessibility for tourists and first-time visitors. Other bridge information sites only list road names with statuses, which can be confusing for those unfamiliar with the area. By displaying bridges directly on an interactive Google Map, users immediately understand where each bridge is located and what its status is.

By building this, I solved a problem I personally face while also helping the community of 100+ local residents and visitors who rely on these bridges daily.

## 🎯 The Problem  

- Lift bridges across the Welland Canal frequently open for ship traffic, delaying cars and pedestrians.

- Local commuters (myself included) often fall behind schedule or get stuck behind raised bridges without warning.

- Existing sites are not tourist-friendly — they show only road names without maps, making it hard for visitors to know which bridge matters for their route.

- Official updates are text-heavy and not mobile-friendly, making it difficult to quickly check bridge status on the go.

## 💡 The Solution

- A real-time interactive map with bridge markers showing live status (open, closed, raising, lowering).

- User location tracking, so commuters and visitors can instantly see which bridges are closest and plan routes.

- Fast updates (every 30 seconds with caching) so people always have current information.

- Helps both local residents avoid delays and tourists navigate the area without needing to know road names.

## 🏗️ Architecture

```text
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────┐
│   Frontend      │◄────► │     Backend     │◄────► │  External Data     │
│ (HTML/JS/CSS,   │       │ (Node.js/Express│       │ (Seaway Bridge Page)│
│  Google Maps API)│      │ + Cheerio)      │       └────────────────────┘
└─────────────────┘       └─────────────────┘
           │                        │
           ▼                        ▼
     User Geolocation          In-memory Cache
     & Map Markers             + Data Scraper
```

## 🛠️ Technologies Used

Frontend

- HTML5, CSS3 (responsive design, mobile-friendly)

- JavaScript ES Modules (modular structure with MapManager, BridgeManager, BridgeService, Sidebar)

- Google Maps JavaScript API

Backend

- Node.js + Express (server + REST API routes)

- Cheerio (HTML parsing for scraping bridge status data)

- node-fetch (to fetch the Seaway bridge status pages)

Other

- In-memory caching (to avoid hammering the source site)

- Deployed on Render (cloud hosting)

## 🚀 Getting Started
### Prerequisites

- Node.js 18+ and npm

- Google Maps API key

### Setup

### 1. Clone the repo

```bash
git clone https://github.com/saqib-21/WellandCanalStatus.git
cd WellandCanalStatus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Google Maps API key in public/index.html
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=initMap" defer></script>
```

### 4 .Run the server
```bash
npm run start
```

### 5. Open in browser 
```text
http://localhost:3000
```

## ✨ Features

- 🟢🔴🟡🟣 Color-coded markers for bridge status  
- 📍 User geolocation tracking  
- 🔄 Auto-refresh every 30s  
- 📱 Responsive design  
- 👥 Used by 100+ commuters  

## ⚠️ Known Issues

- Google Maps API key requires referrer restrictions for deployment (localhost + Render domain).

- Source website’s format may change, which could break the scraper.

## 📚 Learning Outcomes

- Backend: Node.js/Express server design, REST API creation, caching, web scraping.

- Frontend: Modular JavaScript, Google Maps API integration, real-time geolocation.

- Deployment: Hosting on Render, handling API key restrictions.

- Soft Skills: Problem-solving for a real-world community issue, writing maintainable code, documenting projects.

## 🔮 Future Additions

- Expand Coverage: Scale scraping logic to include other lift bridges across Ontario and potentially all of Canada.

- Improved Data Sources: Integrate with official APIs or municipal open data portals (where available) for more reliable updates.

- Push Notifications: Notify users in real time when nearby bridges are opening or closing.

- Mobile Application: Build a native mobile app (iOS/Android) for an even smoother experience, despite already having a mobile-friendly website — a chance to explore mobile development.

- User Features: Allow commuters to “favorite” certain bridges and receive status alerts.

- Analytics Dashboard: Track bridge traffic patterns and opening frequency to give long-term insights.
