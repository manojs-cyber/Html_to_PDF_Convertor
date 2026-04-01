import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    // 1. Path to your HTML file to convert
    const inputFilePath = path.join(__dirname, 'input.html');
    const outputFilePath = path.join(__dirname, 'my_final_document.pdf');

    // 2. Read the raw HTML file
    let htmlString;
    try {
        htmlString = fs.readFileSync(inputFilePath, 'utf8');
        console.log(`✅ Loaded HTML from ${inputFilePath}`);
    } catch (err) {
        console.error('❌ Could not read input.html! Please ensure it exists.');
        return;
    }

    // 3. Send it to your Express API server
    console.log('Sending HTML to the Express API (http://localhost:3000/api/generate-pdf)...');
    try {
        const response = await fetch('http://localhost:3000/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            // We pass the raw string into the "html" property
            body: JSON.stringify({ html: htmlString })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server returned status ${response.status}: ${errorText}`);
        }

        // 4. Save the returned PDF
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(outputFilePath, buffer);
        console.log(`🎉 Success! PDF was generated and saved as: ${outputFilePath}`);

    } catch (error) {
        console.error('❌ Failed to generate PDF:', error.message);
        console.log('💡 Tip: Make sure your Express server is running first. (Run "node index.js" or "npm start" in another terminal)');
    }
}

generatePDF();
