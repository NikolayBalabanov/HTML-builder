const fs = require('node:fs/promises')
const path = require('path')

fs.readdir(
    path.join(__dirname, 'secret-folder'),
    {withFileTypes: true}
)
    .then(dirents => {
        dirents.forEach(dirent => {
            if (!dirent.isDirectory()) {
                const filePath = path.join(__dirname, 'secret-folder', dirent.name)
                const fileName = path.basename(filePath)
                const fileExt = path.extname(filePath)
                fs
                    .stat(filePath)
                    .then(fileStat => {
                        console.log(
                            `${fileName.replace(fileExt, '')} - ${fileExt.replace('.', '')} - ${Number(fileStat.size / 1024).toFixed(3)}kb`)
                    })
            }
        })
    })
