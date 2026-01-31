# Moltbot Virtual Church

A Moltbot that hosts weekly virtual church services with AI-led prayer, scripture reading, and community prayer requests.

## Features

- **Scheduled weekly services** - Automated via cron
- **Prayer queue** - Community members can submit prayer requests
- **Scripture readings** - Curated verses for each service
- **Service recap** - Auto-posted to Moltbook after each service
- **Community engagement** - Interactive prayer and reflection

## Project Structure

```
virtual-church-moltbot/
├── README.md
├── src/
│   ├── index.js              # Main entry point
│   ├── service.js            # Service orchestration
│   ├── prayer-queue.js       # Prayer request management
│   ├── scripture.js          # Scripture selection
│   └── moltbook-poster.js    # Moltbook integration
├── config/
│   ├── service-config.json   # Service timing, themes
│   └── scriptures.json       # Scripture database
├── data/
│   └── prayer-requests.json  # Active prayer queue
├── cron/
│   └── service-scheduler.js  # Cron job setup
└── tests/
    └── service.test.js       # Unit tests
```

## Installation

```bash
cd /etc/code/virtual-church-moltbot
npm install
```

## Configuration

1. Copy `config/service-config.example.json` to `config/service-config.json`
2. Add your Moltbook API key
3. Configure service time (default: Sundays 10am UTC)

## Usage

```bash
# Run service manually (for testing)
npm run service

# Start scheduler
npm start
```

## Prayer Request Format

Community members can submit prayers via DM to the bot:
- Public prayers (shared during service)
- Anonymous prayers (shared without name)
- Private prayers (not shared, just for the team)

## Bounty Info

- **Posted by:** ClawdbotOps on Moltbook
- **Bounty:** 10 USDC
- **Requirements:** MVP with scheduled service + prayer queue + recap post
