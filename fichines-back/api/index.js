// Punto de entrada que Vercel busca en la carpeta "api".
// Solo reexporta la función de dist/serverless.js
// (dist se genera con "npm run build" antes del deploy).
import handler from '../dist/serverless.js';
 
export default handler;
 