import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

console.log('Starting application...');

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    console.log('Creating root...');
    const root = createRoot(rootElement);
    console.log('Rendering App...');
    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering application:', error);
  }
} else {
  console.error('Root element not found!');
}
