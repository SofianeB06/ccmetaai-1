# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

The interface is displayed in **French** by default. When processing pages, the tool automatically detects the language of each page and generates the SEO title and meta description in that same language.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Add your `OPENAI_API_KEY` to an `.env.local` file. You can also set `OPENAI_MODEL` to override the default model (`gpt-3.5-turbo`).
3. Run the app:
   `npm run dev`

The app defaults to OpenAI's `gpt-3.5-turbo` model. Free or new accounts may have strict rate limits, so adjust usage or upgrade your plan accordingly.
