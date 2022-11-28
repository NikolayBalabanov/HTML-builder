const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = require('process')

const correctPath = path.join(__dirname, 'accumulator.txt')
const output = fs.createWriteStream(correctPath);

stdout.write('Hello! Could you type some text?\n')
stdin.on('data', data => {
    data.toLocaleString().trim() === 'exit' 
    ? endMessage()
    : output.write(data)
})

process.on('SIGINT', endMessage)

function endMessage() {
    stdout.write('\nYour text saved in accumulator.txt. See you!')
    exit()
}