import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT = 3000;
const FLASK_PORT = 5000;

console.log('ڈیری فارم مینجمنٹ سسٹم: Starting Python Flask backend...');

// Start Python Flask process
const pythonProcess = spawn('python3', ['app.py'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(FLASK_PORT),
    PYTHONUNBUFFERED: '1',
  },
  stdio: 'inherit',
});

pythonProcess.on('error', (err) => {
  console.error('Failed to start python process:', err);
});

pythonProcess.on('exit', (code, signal) => {
  console.log(`Python process exited with code ${code} and signal ${signal}`);
});

process.on('SIGINT', () => {
  pythonProcess.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  pythonProcess.kill('SIGTERM');
  process.exit();
});

// Proxy all requests directly to Flask server on port 5000
const proxy = createProxyMiddleware({
  target: `http://127.0.0.1:${FLASK_PORT}`,
  changeOrigin: true,
  ws: true,
  // @ts-ignore
  onError: (err, req, res) => {
    (res as any).writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    (res as any).end(`
      <div style="font-family: sans-serif; text-align: center; padding: 60px; direction: rtl;">
        <h2 style="color: #1B5E20; font-size: 24px;">Dairy farm system is starting...</h2>
        <p style="color: #666;">Please wait 2 seconds while the server loads.</p>
        <script>setTimeout(function() { window.location.reload(); }, 2000);</script>
      </div>
    `);
  },
});

app.use(proxy);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Studio Applet ready on http://localhost:${PORT} -> Forwarding to Flask on port ${FLASK_PORT}`);
});
