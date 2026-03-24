# 🗺️ LLM Maps API (Open WebUI Integration)

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

This API is designed to be consumed by an LLM via a Python Tool function. The tool directly hits the endpoints `/api/get-location` and `/api/get-route`, passing the user's prompt as parameters and returning the highly formatted Markdown directly into the chat interface.