# 🗺️ LLM Maps API (Custom UI, Open WebUI & MCP Integration)

A robust, enterprise-grade RESTful API built with Node.js, Express, and TypeScript. This backend is specifically designed to act as an intelligent tool for Large Language Models (LLMs). It features a built-in Llama 3.1 integration using Native Tool Calling for precise entity extraction, enabling AI to seamlessly fetch real-time Google Maps data, location recommendations, and navigation routes.

## ✨ Key Features

* **🤖 AI-Optimized Responses:** Output is heavily formatted in Markdown, allowing LLMs to directly present beautiful, readable data (with emojis and clickable links) and embed interactive/static maps to the end user.
* **🧠 Native Tool Calling (Llama 3.1):** Utilizes strict JSON schema function calling via Ollama for 100% accurate Natural Language Understanding (NLU) and value extraction.
* **🛡️ Strict Type Safety:** Built 100% in TypeScript, utilizing custom interfaces and eliminating `any` types for maximum reliability.
* **🏗️ Clean Architecture:** Follows the Separation of Concerns (SoC) principle, cleanly dividing Controllers, Routes, Types, and Utilities.
* **🧪 Comprehensive Unit Testing:** Fully tested using **Jest** and `node-mocks-http` to ensure production-level stability (covering both happy and sad paths, including AI fail-safes).
* **📱 WhatsApp Deep Linking:** Automatically generates formatted WhatsApp share links for every location recommendation and route.

## 🚀 Tech Stack

* **Frontend:** HTML5, Tailwind CSS, Marked.js (Vanilla JS)
* **Backend Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **AI Engine:** Ollama (Llama 3.1)
* **Testing:** Jest & ts-jest
* **External API:** Google Maps API (Places, Directions, Embed & Static Maps)

## 📂 Project Structure

```text
llm-maps-backend/
├── UI/
│   └── index.html            # Simple Standalone Frontend UI
├── controllers/
│   └── mapController.ts      # Handles HTTP requests, Maps API, and Ollama Tool Calling
├── routes/
│   └── mapRoutes.ts          # Express router definitions
├── types/
│   └── map.types.ts          # TypeScript interfaces (GooglePlace, etc.)
├── utils/
│   └── mapHelpers.ts         # Pure functions for formatting & API key validation
├── tests/
│   ├── mapController.test.ts # Mocked controller unit tests (100% Coverage)
│   └── mapHelpers.test.ts    # Utility unit tests
├── index.html                # 🌟 Standalone AI Chat Frontend UI
├── mcp.js                    # 🧪 Experimental Model Context Protocol (MCP) script
├── open_webui_tool.py        # Python script for Open WebUI integration
├── server.ts                 # Application entry point
├── .env                      # Environment variables (Ignored in Git)
└── package.json
```

## 🛠️ End-to-End Setup Guide

This guide will walk you through the entire process of setting up the LLM Maps API, from configuring Google Cloud to running the AI engine.

### Phase 1: Google Cloud Console Setup (API Key)
To fetch real-time map data, you need a valid Google Maps API Key.

1. **Access the Console:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and log in.
2. **Create a Project:** Click the project dropdown at the top left and select **New Project**.
3. **Set Up Billing:** Google requires an active billing account for Maps APIs.
4. **Enable Required APIs:**
   * Go to **APIs & Services** > **Library**.
   * Enable **Places API**, **Directions API**, **Maps Static API**, and **Maps Embed API**.
5. **Generate the API Key:**
   * Go to **APIs & Services** > **Credentials**.
   * Click **+ CREATE CREDENTIALS** > **API Key**. Copy this key.

### Phase 2: Start the Backend (Express.js)

1. **Clone the repository:**
```bash
git clone [https://github.com/rizqizulfian/llm-maps-backend](https://github.com/rizqizulfian/llm-maps-backend)
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
*(The server should now be running on `http://localhost:8080`)*

5. **Run Unit Tests:**
```bash
npm run test
```

### Phase 3: Install Ollama (Local LLM Engine)
We will use Ollama to power the Natural Language Understanding (NLU) of our backend.

1. **Download Ollama:** Go to [ollama.com](https://ollama.com/) and install it.
2. **Download Llama 3.1 Model:** Open your terminal and pull the model by running:
```bash
ollama run llama3.1
```
*(Leave this running in the background).*

---

## 💻 Integration Approaches

You have two ways to interact with this AI Backend:

### Approach A: Standalone Custom AI Chat UI
--in the last minute, i decided to create custom frontend ui replacing openwebui--
This repository includes a lightweight, fully functional ChatGPT-style web interface built with pure HTML, Tailwind, and JS. It connects directly to the Express backend and renders interactive Google Maps iframes seamlessly.

1. Ensure both your **Express Backend** (`npm start`) and **Ollama** (`ollama run llama3.1`) are running.
2. Open the `index.html` file located in the root directory directly in your web browser (e.g., Chrome, Safari).
3. Type a natural prompt like: *"Find me the best seafood restaurants in Batam Center"* and watch the AI extract the intent, fetch the map data, and render the UI!
<img width="497" height="799" alt="image" src="https://github.com/user-attachments/assets/9a61e327-821b-4b33-ab00-a4ecbeda7931" />

### Approach B: Integrate with Open WebUI (Docker)
If you prefer using a robust third-party LLM dashboard:

1. Start Open WebUI via Docker:
```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```
2. Open your browser and go to: **`http://localhost:3000`**
3. Go to **Settings** > **Connections**. Ensure the Ollama Base URL is set to `http://host.docker.internal:11434`.
4. Create a new Tool in your Workspace and paste the contents of `open_webui_tool.py`.
5. Start a chat, enable the tool, and prompt the AI.

<img width="658" height="377" alt="image" src="https://github.com/user-attachments/assets/0a333ffe-5b1c-45b8-8bf5-a092082617d8" />
<img width="886" height="424" alt="image" src="https://github.com/user-attachments/assets/4c2e5205-e42d-43ca-a8a7-ce90f7a7526a" />
<img width="886" height="424" alt="image" src="https://github.com/user-attachments/assets/1fc0e6c7-c033-48d2-96d5-796bcd0f35ac" />
<img width="957" height="798" alt="image" src="https://github.com/user-attachments/assets/f0ecadad-b5f4-4ed7-b02b-5d440264df9e" />

---

## 🧪 Experimental: Model Context Protocol (MCP)

In addition to the standard REST API and Open WebUI tool, this repository contains an experimental `mcp.js` file. This script is a beta exploration of the **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)**, designed to test direct, standardized tool-calling capabilities for next-generation LLM agents (like Claude Desktop or Cursor). Reviewers and recruiters are welcome to explore this file to see my ongoing R&D in modern AI integration!

**MCP Running Success on MCP Inspector:**
<img width="1470" height="797" alt="Screenshot 2026-03-24 at 21 35 13" src="https://github.com/user-attachments/assets/4c44ed7d-bf8a-441f-8231-f1eb8e5e7f8a" />
