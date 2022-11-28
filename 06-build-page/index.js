const fs = require('fs')
const path = require('path')
const copyFile = fs.promises.copyFile

const projectDist = 'project-dist'
const newDirName = 'files-copy'
const componentsDir = path.join(__dirname, 'components')
const htmlTemplatePath = path.join(__dirname, 'template.html')
const projectFolder = path.join(__dirname, projectDist);

(async () => {
    try {
        const createProjectDist =  fs.mkdir(
            projectFolder, 
            { recursive: true },
            err => {
                if (err) throw new Error('There is some problem with directory (folder already exist or not clean)')
            }
        );
        createAndFillStyleCSS()
        copyAssets()
        createAndFillIndexHTML()
        console.log(`Created ${projectDist} directory`);
    } catch (err) {
        console.error(`Directory ${projectDist} was updated!`);
        const cleanDir = fs.rmdir(
            path.join(__dirname, projectDist), 
            { recursive: true },
            err => {
                if (err) throw new Error('There is some problem with directory (folder already exist or not clean)')
            }
        );
        const createProjectDist = fs.mkdir(
            projectFolder, 
            { recursive: true },
            err => {
                if (err) throw new Error('There is some problem with directory (folder already exist or not clean)')
            }
        );
        createAndFillStyleCSS()
        copyAssets()
        createAndFillIndexHTML()

    }
    
    async function createAndFillIndexHTML() {
        let chank = ''
        async function readHtmlTemplate(htmlTemplatePath) {
            const input = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8')
            const output = fs.createWriteStream(path.join(projectFolder, 'index.html'))
            const htmlComponents = await getHtmlComponents(componentsDir)
            input.on('data', data => {
                chank += data.toString()
                for (const [componentName, componentTemplate] of Object.entries(htmlComponents)) {
                    chank = chank.replace(`{{${componentName}}}`, componentTemplate)
                }
                output.write(chank)
            })
        }
        readHtmlTemplate(htmlTemplatePath)
        
        async function getHtmlComponents(dirPath) {
            const componentsDict = {}
            const files = await fs.promises.readdir(componentsDir, { withFileTypes: true})
            const filesPaths = files
                .filter((dirent) => !dirent.isDirectory())
                .map((dirent) => dirent.name)
                .filter((filename) => path.extname(filename) === '.html')
                .map((file) => [path.basename(file, '.html'), path.join(dirPath, file)])
            for (let filePath of filesPaths) {
                componentsDict[filePath[0]] = await fs.promises.readFile(filePath[1], 'utf-8')
            }
            return componentsDict
        }
    }
    
    function createAndFillStyleCSS() {
        const srcStylesPath = path.join(__dirname, 'styles')
        const distPath = path.join(__dirname, 'project-dist/style.css')
        const output = fs.createWriteStream(distPath)

        fs
            .promises
            .readdir(srcStylesPath)
            .then(files => {
                files.forEach( file => {
                    const filePath = path.join(srcStylesPath, file)
                    const fileName = path.basename(filePath)
                    const fileExt = path.extname(filePath)
                    if (fileExt === '.css') {
                        const input = fs.createReadStream(path.join(srcStylesPath, fileName))
                        input.on('data', data => {
                            output.write(data.toString() + '\n')
                        })
                    }

                })
            })
    }
    
    function copyAssets() {

        fs.promises.mkdir(path.join(projectFolder, 'assets'), { recursive: true });

        async function copyAllInnerFiles(dir, newDir) {
            await fs
                    .promises
                    .readdir((dir), { withFileTypes: true })
                    .then(dirents => {
                        dirents.forEach( async (dirent) => {
                            if (dirent.isDirectory()) {
                                const dirPath = path.join(dir, dirent.name)
                                const newDirPath = path.join(newDir, dirent.name)
                                copyAllInnerFiles(dirPath, newDirPath)
                            } else {
                                fs.mkdir(
                                    newDir, 
                                    { recursive: true },
                                    err => {
                                        if (err) throw new Error('There is some problem with directory (folder already exist or not clean)')
                                    }
                                )
                                const filePath = path.join(dir, dirent.name)
                                copyFile(filePath, path.join(newDir, dirent.name))
                            }
                            
                        })
            })
        }
        let dir = path.join(__dirname, 'assets')
        let newDir = path.join(__dirname, projectDist, 'assets')
        copyAllInnerFiles(dir, newDir)
        
    }

}) ()





