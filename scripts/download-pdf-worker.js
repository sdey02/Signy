const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directory if it doesn't exist
const workerDir = path.join(__dirname, '../public/pdf-worker');
if (!fs.existsSync(workerDir)) {
  fs.mkdirSync(workerDir, { recursive: true });
}

// Get the version from package.json
const packageJson = require('../package.json');
const pdfjsVersion = packageJson.dependencies['pdfjs-dist'].replace('^', '');

// Worker URL
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
const outputPath = path.join(workerDir, 'pdf.worker.min.js');

console.log(`Downloading PDF.js worker v${pdfjsVersion}...`);
console.log(`From: ${workerUrl}`);
console.log(`To: ${outputPath}`);

// Download the file
const file = fs.createWriteStream(outputPath);
https.get(workerUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download worker: ${response.statusCode} ${response.statusMessage}`);
    fs.unlinkSync(outputPath);
    process.exit(1);
  }
  
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('PDF.js worker downloaded successfully!');
  });
}).on('error', (err) => {
  fs.unlinkSync(outputPath);
  console.error(`Error downloading worker: ${err.message}`);
  process.exit(1);
}); 