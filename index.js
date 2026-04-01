const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware configuration
// Increase the payload size limit up to 50mb for large HTML strings
app.use(express.json({ limit: '50mb' }));
// Add support for receiving raw text/html requests directly
app.use(express.text({ type: 'text/html', limit: '50mb' }));

app.post('/api/generate-pdf', async (req, res) => {
  let htmlContent = '';

  // Extract HTML content based on the request type
  if (req.is('text/html')) {
    htmlContent = req.body;
  } else if (req.is('application/json')) {
    htmlContent = req.body.html;
  } else {
    return res.status(400).json({ 
      error: 'Unsupported content type. Please send application/json with an "html" field, or plain text/html body.' 
    });
  }

  // Check if content exists
  if (!htmlContent || typeof htmlContent !== 'string') {
    return res.status(400).json({ error: 'HTML content missing or invalid.' });
  }

  let browser;
  try {
    // Launching a headless Chrome/Chromium instance natively
    browser = await puppeteer.launch({
      headless: true, // Defaults to 'new' internally
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null, // Needed for Docker optimization
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Render HTML onto the page and wait for resources to finish downloading
    await page.setContent(htmlContent, {
      waitUntil: ['load', 'networkidle0']
    });

    // Convert page to PDF
    const pdfBuffer = await page.pdf({
      format: 'A4', // Standard paper size
      printBackground: true, // Ensures CSS backgrounds are included
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    // Set headers specifying a PDF response (can be downloaded directly or previewed in browser)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('An error occurred during PDF generation:', error);
    res.status(500).json({ error: 'Failed to generate PDF from the provided HTML.' });
  } finally {
    if (browser) {
      await browser.close(); // Prevent memory leaks by closing browser
    }
  }
});

// Root endpoint just for diagnostics
app.get('/', (req, res) => {
  res.send('HTML to PDF API Service is up and running. Use POST /api/generate-pdf');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
