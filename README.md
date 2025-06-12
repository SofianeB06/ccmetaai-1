# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

The interface is displayed in **French** by default. When processing pages, the tool automatically detects the language of each page and generates the SEO title and meta description in that same language.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (also used if `detectLanguage` relies on Gemini)
3. Run the app:
   `npm run dev`
