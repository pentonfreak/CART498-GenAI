# THE LAST SIGNAL — Prototype 1

**CART 498 / Text-to-text communication experiment**

## What it does

An interactive sci-fi website for testing whether a human idea survives being translated into a symbolic transmission. An AI **encoder** writes a symbol-based message. A *separate* AI **decoder** interprets the message without ever receiving the original concept. Compare the two meanings.

**Prototype 1 is text only.** AI-generated images and AI visual decoding are planned for later prototypes. The waveform is a decorative JavaScript graphic, not AI-generated content.

## Requirements

- Windows / macOS / Linux
- Node.js **18 or newer** (tested with Node 22)
- Modern web browser
- **For live AI only:** internet access and Gemini API key from Google AI Studio (https://aistudio.google.com). Your API tier and model may have usage restrictions or charges. Check current quota and pricing (https://ai.google.dev/gemini-api/docs/pricing).
- No local GPU required for live API use.

## Quick start (Windows PowerShell)

1. Unzip the project, open the folder in VS Code, and open **Terminal → New Terminal**.
2. Run:

   ```powershell
   node server.mjs
   ```

3. Visit **http://127.0.0.1:3000**.
4. Choose a concept, leave **Offline example** selected, and click **Transmit**. This works immediately without any API key.

**Important:** Offline examples are handwritten sample texts, not outputs from an AI model. They exist to test the website's design and interactions.

### Turn on live Gemini AI

1. Create your own API key in [Google AI Studio](https://aistudio.google.com).
2. In the **same PowerShell terminal**, press Ctrl+C to stop the server. Set the key for the session and restart:

   ```powershell
   $env:GEMINI_API_KEY = 'YOUR_API_KEY'
   node server.mjs
   ```

3. Refresh the page. You should see **LIVE AI READY**. Select **Live AI** and transmit.
4. The server sends **two separate calls** to Gemini: one to encode, one to decode. Each live transmission consumes two model calls.
5. If the API returns `model not found` or quota errors, find an enabled text model in AI Studio and configure it before starting the server:

   ```powershell
   $env:GEMINI_MODEL = 'gemini-3.8-flash'
   node server.mjs
   ```

   The sample model is from Google's documentation at development time; the available models and free tier can change. Use one enabled for your API key.

### macOS / Linux

```bash
GEMINI_API_KEY='YOUR_API_KEY' node server.mjs
```

If you need to change the model:

```bash
GEMINI_MODEL='gemini-3.8-flash' GEMINI_API_KEY='YOUR_API_KEY' node server.mjs
```

## Project architecture

```text
Visitor selects Freedom
        |
        v
Browser UI (HTML/CSS/JavaScript)
        |
        v
Local Node.js server (keeps API key private)
        |
        +---> Gemini call #1: ENCODER [receives "Freedom"]
        |          |
        |          v
        |     Symbolic text transmission
        |          |
        +---> Gemini call #2: DECODER [receives ONLY symbolic text]
                   |
                   v
             Interpretation + evidence + alternative
                   |
                   v
          Website reveals original concept
```

**Experimental limitation:** The decoder is a general-purpose language model simulating an unknown recipient. It is *not* an extraterrestrial intelligence. Some familiar symbolic associations may be shared between the encoder and decoder through training data. Avoid claiming that this measures real cross-cultural or interspecies communication.

## Suggested first experiment

1. Choose **Freedom** and generate one live result.
2. Note the visual symbols used and whether the decoder inferred the intended idea.
3. Repeat 2–3 times. Compare changes in the encoded text and interpretation.
4. Repeat for **Home** and **Curiosity**.
5. Click **Copy this experiment** and paste your results into a research journal.

A stronger experiment compares multiple runs for each concept, records model versions/settings, and includes your own assessment of meaning preservation.

## Security and privacy

- Your secret key is read from a server environment variable, never sent to the browser.
- Do not commit keys, `.env` files, or screenshots showing keys to GitHub.
- The server binds to **127.0.0.1 only**, for local development. Do not expose it publicly without proper authentication, rate limiting, and additional protections.
- In live mode, symbolic messages and original concepts are sent to Google's API; do not input sensitive personal information.
- No account, persistent database, file upload, or local disk storage is used by this prototype.
- The default local server supports a small 6-live-requests-per-minute limit to avoid accidental repeated requests, but this isn't a production security solution.

## Files

- `server.mjs` — local HTTP server and two AI calls
- `public/index.html` — page structure
- `public/style.css` — visual design
- `public/app.js` — controls, waveform, and experiment display

## Next steps

- **Prototype 2:** turn the symbolic text into an AI-generated visual message.
- **Prototype 3:** give only the generated image to a multimodal decoder model.
- **Prototype 4:** add visual polish, revision tools, archived runs, and sound.

## References

Google. n.d. “Getting Started.” *Gemini API*. Accessed November 17, 2026. https://ai.google.dev/gemini-api/docs/get-started.

Google. n.d. “Text Generation.” *Gemini API*. Accessed November 17, 2026. https://ai.google.dev/gemini-api/docs/generate-content/text-generation.

Google. n.d. “Gemini Developer API Pricing.” *Google AI for Developers*. Accessed November 17, 2026. https://ai.google.dev/gemini-api/docs/pricing.
