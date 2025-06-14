
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n.tsx';

// This is a placeholder for process.env.OPENAI_API_KEY.
// In a real build environment, this would be set through environment variables.
// For demonstration purposes, you can replace "YOUR_OPENAI_API_KEY" with an actual key.
// IMPORTANT: Do not commit your actual API key to version control.
if (!process.env.OPENAI_API_KEY) {
  console.warn(
    'OPENAI_API_KEY environment variable is missing. ' +
    'Some functionality may not work until it is set.'
  );
} else if (process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
  console.warn(
    'Using placeholder OpenAI API Key. ' +
    'Please set your actual OPENAI_API_KEY environment variable.'
  );
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
