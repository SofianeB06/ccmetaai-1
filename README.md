# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

The interface is displayed in **French** by default. When processing pages, the tool automatically detects the language of each page and generates the SEO title and meta description in that same language.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key
3. (Optional) Set `CONCURRENCY_LIMIT` to control how many URLs are processed in parallel and `OPENAI_MODEL` to specify the OpenAI model.
4. Run the app:
   `npm run dev`

## License

This project is licensed under the [MIT License](LICENSE).
