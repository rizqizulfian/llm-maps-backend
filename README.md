# 🗺️ LLM Maps API (Open WebUI & MCP Integration)

A robust, enterprise-grade RESTful API built with Node.js, Express, and TypeScript. This backend is specifically designed to act as an intelligent tool for Large Language Models (LLMs) within Open WebUI, enabling AI to seamlessly fetch real-time Google Maps data, location recommendations, and navigation routes.

## ✨ Key Features

* **🤖 AI-Optimized Responses:** Output is heavily formatted in Markdown, allowing LLMs to directly present beautiful, readable data (with emojis and clickable links) and embed static map to the end user.
<img width="658" height="377" alt="image" src="https://github.com/user-attachments/assets/0a333ffe-5b1c-45b8-8bf5-a092082617d8" />
<img width="886" height="424" alt="image" src="https://github.com/user-attachments/assets/4c2e5205-e42d-43ca-a8a7-ce90f7a7526a" />

* **🛡️ Strict Type Safety:** Built 100% in TypeScript, utilizing custom interfaces and eliminating `any` types for maximum reliability.
* **🏗️ Clean Architecture:** Follows the Separation of Concerns (SoC) principle, cleanly dividing Controllers, Routes, Types, and Utilities.
* **🧪 Comprehensive Unit Testing:** Fully tested using **Jest** and `node-mocks-http` to ensure production-level stability (covering both happy and sad paths).
* **📱 WhatsApp Deep Linking:** Automatically generates formatted WhatsApp share links for every location recommendation and route.
<img width="886" height="424" alt="image" src="https://github.com/user-attachments/assets/1fc0e6c7-c033-48d2-96d5-796bcd0f35ac" />
<img width="957" height="798" alt="image" src="https://github.com/user-attachments/assets/f0ecadad-b5f4-4ed7-b02b-5d440264df9e" />

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

## 🛠️ End-to-End Setup Guide

This guide will walk you through the entire process of setting up the LLM Maps API, from configuring Google Cloud to running the AI engine and Open WebUI interface.

### Phase 1: Google Cloud Console Setup (API Key)
To fetch real-time map data, you need a valid Google Maps API Key.

1. **Access the Console:** Go to the [Google Cloud Console](https://console.cloud.google.com/) and log in.
2. **Create a Project:** Click the project dropdown at the top left and select **New Project**.
3. **Set Up Billing:** Google requires an active billing account for Maps APIs (they offer a free monthly tier).
4. **Enable Required APIs:**
   * Go to **APIs & Services** > **Library**.
   * Search for **Places API** and click **Enable**.
   * Search for **Directions API** and click **Enable**.
5. **Generate the API Key:**
   * Go to **APIs & Services** > **Credentials**.
   * Click **+ CREATE CREDENTIALS** > **API Key**. Copy this key.

### Phase 2: Start the Backend (Express.js)

1. **Clone the repository:**
```bash
git clone https://github.com/rizqizulfian/llm-maps-backend
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
Open WebUI requires a backend engine to run the AI models locally. We will use Ollama.

1. **Download Ollama:** Go to [ollama.com](https://ollama.com/) and download the installer for your operating system (Mac/Windows/Linux).
2. **Install and Run:** Follow the installation setup. Once installed, ensure the Ollama app is running in your background.
3. **Download an AI Model:** Open your terminal and pull a capable model (e.g., Llama 3) by running:
```bash
ollama run llama3
```
*(Wait for the download to finish. You can type `/bye` to exit the prompt once it's done).*

### Phase 4: Start Open WebUI (Docker)
We use Docker to run Open WebUI.

1. Open your terminal and run the following Docker command:
```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```
2. Wait a few moments, then open your browser and go to: **`http://localhost:3000`**
3. Create an admin account and log in.
4. **Verify Ollama Connection:** In Open WebUI, go to **Settings** > **Connections**. Ensure the Ollama Base URL is set to `http://host.docker.internal:11434`.

### Phase 5: Integrate the Tool in Open WebUI

1. **Create the Tool:**
   * In Open WebUI, click your profile icon > **Workspace** > **Tools**.
   * Click the **+** button to add a new tool.
   * Copy the entire content of the [`open_webui_tool.py`](./open_webui_tool.py) file from this repository and paste it into the editor. Save it.
2. **Configure the System Prompt:**
   * Go to **Settings** > **General** > **System Prompt**.
   * Paste: *"You are an intelligent Google Maps Assistant. Whenever you invoke a tool and receive a response formatted in Markdown, you MUST output that EXACT Markdown text directly to the user without adding any introductory phrases or summarizing."*
3. **Ready to Prompt:** Start a chat, select your downloaded model (e.g., Llama 3) at the top of the screen, ensure the tool is toggled ON, and ask: *"Find me 5 cozy cafes in Batam Center."*

## 🧪 Experimental: Model Context Protocol (MCP)

In addition to the standard REST API and Open WebUI tool, this repository contains an experimental `mcp.js` file. This script is a beta exploration of the **[Model Context Protocol (MCP)](https://modelcontextprotocol.io/)**, designed to test direct, standardized tool-calling capabilities for next-generation LLM agents (like Claude Desktop or Cursor). Reviewers and recruiters are welcome to explore this file to see my ongoing R&D in modern AI integration!

MCP Running Success on MCP Inspector
<img width="1470" height="797" alt="Screenshot 2026-03-24 at 21 35 13" src="https://github.com/user-attachments/assets/4c44ed7d-bf8a-441f-8231-f1eb8e5e7f8a" />
