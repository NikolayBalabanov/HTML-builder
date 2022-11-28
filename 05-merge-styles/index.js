const fsP = require('node:fs/promises')
const fs = require('fs')
const path = require('path')

const srcStylesPath = path.join(__dirname, 'styles')
const distPath = path.join(__dirname, 'project-dist/bundle.css')
const output = fs.createWriteStream(distPath)

fsP
    .readdir(srcStylesPath)
    .then(files => {
        files.forEach( file => {
            const filePath = path.join(srcStylesPath, file)
            const fileName = path.basename(filePath)
            const fileExt = path.extname(filePath)
            if (fileExt === '.css') {
                const input = fs.createReadStream(path.join(srcStylesPath, fileName))
                input.on('data', data => {
                    output.write(data.toString())
                })
            }

        })
    })