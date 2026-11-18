import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  inquirePin,
  getProductsForNumber,
  checkStatus,
  getSystemInfo,
  getCodeDescription,
  getCountryPrefix,
  redeemVoucher,
  submitHelp,
  KNOWN_RESPONSE_CODES,
  SUPPORTED_LANGUAGES
} from './server/xlbagus.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json());

// API Endpoints for XL Bagus Engine
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'XL Bagus Voucher Engine',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/xlbagus/info', async (req: Request, res: Response) => {
  const lang = (req.query.lang as string) || 'EN';
  const forceMock = req.query.mock === 'true';
  try {
    const info = await getSystemInfo(lang, forceMock);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/inquire', async (req: Request, res: Response) => {
  const { pinNumber, lang = 'EN', mode = 'auto' } = req.body;
  if (!pinNumber) {
    res.status(400).json({ error: 'Pin number is required.' });
    return;
  }
  try {
    const forceMock = mode === 'mock';
    const result = await inquirePin(pinNumber, lang, forceMock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/redeem', async (req: Request, res: Response) => {
  const { pinNumber, country, mobilePrefix, mobileNumber, product, yourMobileNumber, lang = 'EN', mode = 'auto' } = req.body;
  if (!pinNumber || !mobileNumber) {
    res.status(400).json({ error: 'Pin Number and Mobile Number are required.' });
    return;
  }
  try {
    const forceMock = mode === 'mock';
    const result = await redeemVoucher(pinNumber, country, mobilePrefix, mobileNumber, product, yourMobileNumber, lang, forceMock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/products', async (req: Request, res: Response) => {
  const { pinNumber, mobileNumber, country = 'INDONESIA', lang = 'EN', mode = 'auto' } = req.body;
  if (!mobileNumber) {
    res.status(400).json({ error: 'Mobile recipient number is required.' });
    return;
  }
  try {
    const forceMock = mode === 'mock';
    const result = await getProductsForNumber(pinNumber || '1234567890123456', mobileNumber, country, lang, forceMock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/status', async (req: Request, res: Response) => {
  const { serialNumber, pinNumber, lang = 'EN', mode = 'auto' } = req.body;
  if (!serialNumber && !pinNumber) {
    res.status(400).json({ error: 'Either Serial Number or Pin Number is required.' });
    return;
  }
  try {
    const forceMock = mode === 'mock';
    const result = await checkStatus(serialNumber, pinNumber, lang, forceMock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/help', async (req: Request, res: Response) => {
  const { serialNumber = '', yourMobileNumber = '', yourQuestion = '', emailAddress = '', lang = 'EN', mode = 'auto' } = req.body;
  if (!yourMobileNumber.trim() || !yourQuestion.trim()) {
    res.status(400).json({ error: 'Mobile Number and Question are required.' });
    return;
  }
  try {
    const forceMock = mode === 'mock';
    const result = await submitHelp(serialNumber, yourMobileNumber, yourQuestion, emailAddress, lang, forceMock);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/code-desc', async (req: Request, res: Response) => {
  const { code, lang = 'EN' } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Response code is required.' });
    return;
  }
  try {
    const desc = await getCodeDescription(String(code), lang);
    res.json({ code, description: desc, known: KNOWN_RESPONSE_CODES[code] || null });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/xlbagus/prefix', async (req: Request, res: Response) => {
  const { country = 'INDONESIA', lang = 'EN' } = req.body;
  try {
    const prefix = await getCountryPrefix(country, lang);
    res.json({ country, prefix });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/xlbagus/constants', (_req: Request, res: Response) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    responseCodes: KNOWN_RESPONSE_CODES
  });
});

// Vite Middleware integration for dev / static for prod
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] XL Bagus App running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
