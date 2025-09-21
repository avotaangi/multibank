const https = require('https');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');

// Создаем самоподписанный SSL сертификат если его нет
const createSelfSignedCert = () => {
  const { execSync } = require('child_process');
  const certDir = path.join(__dirname, 'ssl');
  
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }
  
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('🔐 Создаем самоподписанный SSL сертификат...');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=MultiBank/OU=IT/CN=localhost"`, { stdio: 'inherit' });
      console.log('✅ SSL сертификат создан');
    } catch (error) {
      console.error('❌ Ошибка создания SSL сертификата:', error.message);
      process.exit(1);
    }
  }
  
  return { keyPath, certPath };
};

const proxy = httpProxy.createProxyServer({});

const httpsPort = 8443; // Telegram требует порты 80, 88, 443 или 8443
const vitePort = 5173; // Порт Vite dev сервера

// Создаем SSL сертификат
const { keyPath, certPath } = createSelfSignedCert();

// Читаем SSL сертификаты
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Создаем HTTPS сервер
const server = https.createServer(options, (req, res) => {
  // Проксируем все запросы на Vite dev сервер
  proxy.web(req, res, { 
    target: `http://localhost:${vitePort}`,
    secure: false
  });
});

server.listen(httpsPort, () => {
  console.log(`🔒 HTTPS сервер запущен на https://localhost:${httpsPort}`);
  console.log(`📱 Telegram Web App URL: https://localhost:${httpsPort}`);
  console.log(`⚠️  Внимание: Используйте самоподписанный сертификат для разработки`);
  console.log(`✅ Порт ${httpsPort} готов для Telegram Web App!`);
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something went wrong with the proxy or Vite server is not running.');
});

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Останавливаем HTTPS сервер...');
  server.close(() => {
    console.log('✅ HTTPS сервер остановлен');
    process.exit(0);
  });
});
