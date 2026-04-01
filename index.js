import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming plain text or HTML requests
app.use(express.text({ type: ['text/html', 'text/plain'], limit: '10mb' }));
// Middleware to parse JSON (if you decide to send data as a JSON object)
app.use(express.json({ limit: '10mb' }));

/**
 * POST /api/pdf
 * Accepts HTML string in the request body and returns a PDF file.
 */
app.post('/api/generate-pdf', async (req, res) => {
  // Extract the HTML content from the request body
  let htmlString = '';

  if (typeof req.body === 'string') {
    htmlString = req.body; // If sent as raw text/html
  } else if (req.body && req.body.html) {
    htmlString = req.body.html; // If sent as JSON: { "html": "<h1>...</h1>" }
  }

  // Validate that we actually received HTML
  if (!htmlString || htmlString.trim() === '') {
    return res.status(400).json({ error: 'No HTML content provided in the request body.' });
  }

  let browser;
  try {
    // 1. Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      // Optional args to make it run smoother on certain servers
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 2. Set the HTML content
    await page.setContent(htmlString, { waitUntil: 'networkidle0' });

    // 3. Generate the PDF Buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    // 4. Set the proper headers to send a file back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated-document.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);

    // 5. Send the PDF file
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'An error occurred while generating the PDF.' });
  } finally {
    // 6. Always close the browser to prevent memory leaks
    if (browser) {
      await browser.close();
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});