# Latex AI Recognizer

A modern, cross-platform desktop application to recognize mathematical formulas from images and convert them to LaTeX using AI (OpenAI, Gemini, Ollama).

## Features

- **Clipboard Paste**: Press `Cmd+V` (macOS) or `Ctrl+V` (Windows) to paste an image.
- **Drag & Drop**: Drag images directly into the window.
- **AI-Powered**: Uses Vision-capable LLMs (GPT-4o, Gemini 1.5 Flash, LLaVA).
- **Real-time Rendering**: Instantly preview the LaTeX formula.
- **Cross-Platform**: Works on macOS and Windows.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

Click the **Settings** (gear icon) to configure your API:

- **Base URL**: 
  - OpenAI: `https://api.openai.com/v1`
  - Ollama: `http://localhost:11434/v1` (Make sure Ollama is running)
- **API Key**: Your API key (leave empty for local Ollama if not required).
- **Model**: `gpt-4o`, `gemini-1.5-flash`, `llava`, etc.

## Troubleshooting

If you encounter issues with `electron-builder` (packaging) due to network restrictions, try setting the electron mirror:

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npm run build
```
