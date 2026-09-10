import './styles.css';
import { ZenithApp } from './app.js';

// Exposed on window because the markup in index.html calls it directly
// via inline `onclick="app.someMethod()"` handlers.
window.app = new ZenithApp();
