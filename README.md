# DTexer - AI-powered LaTeX Recognizer

A modern, cross-platform application (desktop or web via Docker) to recognize mathematical formulas from images and convert them to LaTeX using AI (OpenAI, Gemini, Ollama).

## Features

- **AI-Powered LaTeX Recognition**: Converts mathematical formulas from images into LaTeX code using advanced Vision-capable LLMs.
- **Manual LaTeX Editing**: Modify generated or custom LaTeX code with real-time preview rendering.
- **Quick Insert Symbol Palette**: Easily insert common LaTeX symbols (Greek letters, operators, matrices, etc.) into the editor.
- **Flexible Input**: Paste images from clipboard (`Cmd+V`/`Ctrl+V`), or use drag & drop for image files.
- **Customizable UI**: Resizable split panes for adjusting the workspace layout.
- **Cross-Platform Desktop App**: Available on macOS and Windows (via Electron build).
- **Dockerized Web App**: Deployable as a web service with a built-in API proxy for secure backend configuration.
- **Secure Hosted Service**: Option to use a hosted AI service with an access key, keeping your actual API keys hidden from the client.

## Setup & Deployment

### 1. Local Development (Electron Desktop App)

To run the application in a traditional desktop development environment:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```

### 2. Dockerized Web Application

Deploy DTexer as a web service, ideal for shared environments or private hosting with built-in API keys.

1.  **Build the Docker Image**:
    ```bash
    docker build -t dtexer-web-app .
    ```
2.  **Run the Docker Container**:
    You must provide the AI API credentials (which will be hidden from the frontend users) and a custom access key for your users.

    ```bash
    docker run -p 3000:3000 \
      -e HIDDEN_API_BASE="https://api.openai.com/v1" \
      -e HIDDEN_API_KEY="sk-your-super-secret-openai-key" \
      -e APP_ACCESS_SECRET="your-chosen-access-password" \
      dtexer-web-app
    ```
    *Replace the example values with your actual API details and desired access secret.*

3.  **Access the Web App**:
    Open your browser to `http://localhost:3000`.

### 3. Build for Production (Electron Desktop App)

To package the application for desktop distribution:

```bash
npm run build
```
The packaged application will be found in the `dist/` directory.

## Configuration

DTexer offers flexible API configuration via the **Settings** (gear icon) in the header.

### Hosted Mode (Recommended for Docker Deployment)

This mode uses a built-in server (when running in Docker) to proxy requests to your AI provider, keeping your API keys secure on the server.

1.  Click **Settings** (gear icon).
2.  Select **Hosted**.
3.  Enter the **Access Key** provided by the server administrator (e.g., set via `APP_ACCESS_SECRET` in Docker).
4.  Click "Verify Connection" to confirm access.

### Custom API Mode (Default for Local Development / Direct Access)

This mode allows you to directly configure any OpenAI-compatible API provider.

1.  Click **Settings** (gear icon).
2.  Select **Custom API**.
3.  **Base URL**:
    *   OpenAI: `https://api.openai.com/v1`
    *   Ollama: `http://localhost:11434/v1` (ensure Ollama is running locally)
4.  **API Key**: Your API key (e.g., `sk-xxxxxxxxxxxxxxxxxxx`). Leave empty for local Ollama if not required.
5.  **Model**: Specify the model, e.g., `gpt-4o`, `gemini-1.5-flash`, `llava`, etc.
6.  Click "Verify Connection" to confirm your settings.

## Troubleshooting

-   **`electron-builder` issues**: If packaging fails due to network restrictions, try setting an Electron mirror:
    ```bash
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npm run build
    ```
-   **Docker Environment Variables**: Ensure `HIDDEN_API_KEY` and `APP_ACCESS_SECRET` are correctly set when running the Docker container.
-   **API Errors**: Check the browser's developer console for detailed API error messages, or the Docker container logs if running in Hosted mode.