const fs = require('fs')
const path = require('path')
const copyFile = fs.promises.copyFile
const parentDirName = 'files'
const newDirName = 'files-copy'

async function copyDir() {

    const projectFolder = path.join(__dirname, newDirName);

    try {
        const createDir = await fs.promises.mkdir(projectFolder, { recursive: false });
        await fillDirectory()
        console.log(`Created ${newDirName} directory`);
    } catch (err) {
        console.error(`Directory ${newDirName} was updated!`);
        const cleanDir = await fs.promises.rmdir(path.join(__dirname, newDirName), { recursive: true });
        const createDir = await fs.promises.mkdir(projectFolder, { recursive: false });
        await fillDirectory()
    }
    
    function fillDirectory() {
        return fs
                .promises
                .readdir(path.join(__dirname, parentDirName))
                .then(files => {
                    files.forEach(file => {
                        const filePath = path.join(__dirname, parentDirName, file)
                        copyFile(filePath, path.join(__dirname, newDirName, file))
                        console.log(file)
                    })
                })
    }
}
copyDir()