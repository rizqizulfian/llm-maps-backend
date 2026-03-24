# 🗺️ LLM Maps API (Open WebUI & MCP Integration)

A robust, enterprise-grade RESTful API built with Node.js, Express, and TypeScript. This backend is specifically designed to act as an intelligent tool for Large Language Models (LLMs) within Open WebUI, enabling AI to seamlessly fetch real-time Google Maps data, location recommendations, and navigation routes.

## ✨ Key Features

* **🤖 AI-Optimized Responses:** Output is heavily formatted in Markdown, allowing LLMs to directly present beautiful, readable data (with emojis and clickable links) to the end user.
* **🛡️ Strict Type Safety:** Built 100% in TypeScript, utilizing custom interfaces and eliminating `any` types for maximum reliability.
* **🏗️ Clean Architecture:** Follows the Separation of Concerns (SoC) principle, cleanly dividing Controllers, Routes, Types, and Utilities.
* **🧪 Comprehensive Unit Testing:** Fully tested using **Jest** and `node-mocks-http` to ensure production-level stability (covering both happy and sad paths).
* **📱 WhatsApp Deep Linking:** Automatically generates formatted WhatsApp share links for every location recommendation and route.

## 🚀 Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Testing:** Jest & ts-jest
* **External API:** Google Maps API (Places & Directions)

## 📂 Project Structure

```text
llm-maps-backend/
├── controllers/
│   └── mapController.ts      # Handles HTTP requests & responses
├── routes/
│   └── mapRoutes.ts          # Express router definitions
├── types/
│   └── map.types.ts          # TypeScript interfaces (GooglePlace, etc.)
├── utils/
│   └── mapHelpers.ts         # Pure functions for formatting & API key validation
├── tests/
│   ├── mapController.test.ts # Mocked controller unit tests
│   └── mapHelpers.test.ts    # Utility unit tests
├── .env                      # Environment variables (Ignored in Git)
├── mcp.js                    # 🧪 Experimental Model Context Protocol (MCP) script
├── open_webui_tool.py        # Python script for Open WebUI integration
├── server.ts                 # Application entry point
└── package.json
```

## 🛠️ Installation & Setup

1. **Clone the repository:**
```bash
git clone <your-repository-url>
cd llm-maps-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the root directory and add your Google Maps API Key:
```env
PORT=8080
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

4. **Run the server (Development):**
```bash
npm start
```

5. **Run Unit Tests:**
```bash
npm run test
```

## 🔗 Open WebUI Python Tool Integration

This API is designed to be consumed by an LLM via a Python Tool function in Open WebUI. 

To test this integration:
1. Open your Open WebUI Workspace.
2. Navigate to the **Tools** section and create a new tool.
3. Copy the entire content of the [`open_webui_tool.py`](./open_webui_tool.py) file included in this repository and paste it into the tool editor.
4. The LLM will automatically parse the docstrings and trigger the endpoints `/api/get-location` and `/api/get-route` whenever a user asks for map recommendations or navigation.

## 🧪 Experimental: Model Context Protocol (MCP)

In addition to the standard REST API and Open WebUI tool, this repository contains an experimental `mcp.js` file. This script is a beta exploration of the **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)**, designed to test direct, standardized tool-calling capabilities for next-generation LLM agents (like Claude Desktop or Cursor). Reviewers and recruiters are welcome to explore this file to see my ongoing R&D in modern AI integration!