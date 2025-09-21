const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = 'localhost';

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  // Простой прокси к Vite dev серверу
  const proxyReq = http.request({
    hostname: 'localhost',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, HOST, () => {
  console.log(`🌐 HTTP сервер запущен на http://localhost:${PORT}`);
  console.log(`📱 Используйте этот URL для тестирования`);
  console.log(`✅ Порт ${PORT} готов для использования!`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT} уже используется`);
  } else {
    console.error('❌ Ошибка сервера:', err);
  }
});
