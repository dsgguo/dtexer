import axios from 'axios';

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export async function recognizeLatex(imageBase64: string, config: ApiConfig): Promise<string> {
  const { baseUrl, apiKey, model } = config;

  // Clean base64 string if it contains metadata
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // Construct the payload based on standard OpenAI Vision format
  // This works for OpenAI, Gemini (via compat), and Ollama (if vision model supported)
  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please transcribe the mathematical formula in this image into pure LaTeX code. Do not wrap it in markdown code blocks like ```latex ... ```. Just return the LaTeX code itself. If there is text mixed with math, transcribe it as well using appropriate LaTeX environments."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${cleanBase64}`
            }
          }
        ]
      }
    ],
    max_tokens: 4096
  };

  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`, // Appending /chat/completions to base URL
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Clean up if the model was chatty despite instructions
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith("```latex")) {
        cleanedContent = cleanedContent.replace(/^```latex\n?/, "").replace(/\n?```$/, "");
    } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }

    return cleanedContent;
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.response) {
       throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Network/Unknown Error: ${error.message}`);
  }
}

export async function verifyConnection(config: ApiConfig): Promise<void> {
  const { baseUrl, apiKey, model } = config;
  
  const payload = {
    model: model,
    messages: [
      {
        role: "user",
        content: "ping"
      }
    ],
    max_tokens: 1
  };

  try {
    await axios.post(
      `${baseUrl}/chat/completions`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
  } catch (error: any) {
    console.error("Verification Error:", error);
    if (error.response) {
       throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Network/Unknown Error: ${error.message}`);
  }
}
