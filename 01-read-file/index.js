const fs = require('fs')
const path = require('path');
const { stdout } = process;

const stream = fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf-8');
stream.on('data', chunk => stdout.write(chunk));
stream.on('error', error => console.log('Error', error.message));