const fs = require('fs');

async function testJsonPayload() {
  // Option 1: The JSON payload where "html" contains our string
  const payload = {
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Test PDF</title>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; }
              h1 { color: #2c3e50; }
              p { font-size: 16px; color: #34495e; line-height: 1.6; }
              .box { border: 2px solid #3498db; padding: 20px; border-radius: 8px; background-color: #ecf0f1; margin-top: 20px; }
          </style>
      </head>
      <body>
          <h1>PDF Generation Successful! 🎉</h1>
          <div class="box">
              <p>This PDF was generated successfully by using <strong>Option 1</strong>.</p>
              <p>We sent a <code>JSON</code> object to the Express API containing the HTML string.</p>
              <p>Generation Time: ${new Date().toLocaleString()}</p>
          </div>
      </body>
      </html>
    `
  };

  console.log('Sending JSON payload to http://localhost:3000/api/generate-pdf ...');
  
  try {
    // using native fetch available in Node 18+
    const response = await fetch('http://localhost:3000/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // Highlighting Option 1
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}. Details: ${errorText}`);
    }

    // Convert response back to a downloadable buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save locally to verify
    fs.writeFileSync('output-option1.pdf', buffer);
    console.log('✅ Success! PDF saved as "output-option1.pdf" in your current folder.');

  } catch (error) {
    console.error('❌ Error testing the API:', error.message);
    console.log('Make sure your Express server is running first! (Run "npm start" in another terminal)');
  }
}

testJsonPayload();
