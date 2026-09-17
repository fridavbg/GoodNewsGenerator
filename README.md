# GoodNews Generator

An AI-powered news aggregator that surfaces positive, constructive stories on any topic using the Claude API.

## Overview

GoodNews filters through news articles and uses Claude to identify and summarize positive, solution-oriented stories. Instead of doom-scrolling, discover progress and hope in the topics you care about.

## Features

- 🔍 **Smart Search**: Find news on any topic
- 🤖 **AI Analysis**: Claude filters for positive/constructive framing
- 📰 **Summary**: Get concise summaries with "why this is good news" context
- ⭐ **Save Stories**: Bookmark your favorite positive news
- 🎨 **Clean UI**: Modern, responsive interface

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Claude API (Anthropic)
- NewsAPI

**Frontend:**
- React + TypeScript
- Redux (state management)
- Axios (HTTP client)

## Getting Started

### Prerequisites

- Node.js v24+ (via nvm)
- API keys:
  - [Anthropic Claude API](https://console.anthropic.com/)
  - [NewsAPI](https://newsapi.org/)

### Installation

1. Clone the repo:
```bash
git clone git@github.com:fridavbg/GoodNewsGenerator.git
cd GoodNewsGenerator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `backend/.env`: