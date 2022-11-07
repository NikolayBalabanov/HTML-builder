const fs = require('fs')
const path = require('path')
const copyFile = fs.promises.copyFile

const projectDist = 'project-dist'
const newDirName = 'files-copy'
const componentsDir = path.join(__dirname, 'components')

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
        // await fillDirectory()
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
        // await fillDirectory()
        copyAssets()
        createAndFillIndexHTML()

    }
    
    function createAndFillIndexHTML() {
        const input = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8')
        const output = fs.createWriteStream(path.join(projectFolder, 'index.html'))

        let chank = ''

        input.on('data', data => {
            chank = data.toString()
        })

        function getCorrectFormatTag(item) {
            return `{{${item}}}`
        }

        fs.readdir(
            componentsDir,
            { withFileTypes: true },
            (err, dirents) => {
                if (err) throw new Error('Try to read components, but something goes wrong!');

                const componentsArr = []
                dirents.forEach(dirent => {
                    const fileName = dirent.name.match(/([\w]*\.)*/)[0].replace('.', '')
                    componentsArr.push(getCorrectFormatTag(fileName))
                })

                console.log(componentsArr)
                const copyHtml = copyFile(path.join(__dirname, 'template.html'), path.join(projectFolder, 'index.html'))
                    .then(result => {
                        result.forEach((component, i) => {
                            const readStream = fs.createReadStream(path.join(__dirname, 'components', component), 'utf-8')
                            readStream.on('data', data => {
                                chank = chank.replace(componentsArr[i], data)
            
                                if (!componentsArr.find(temp => chank.includes(temp))) {
                                    output.write(chank)
                                }
                            })
                        })
                    })
            }
        )
        
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
                            output.write(data.toString())
                        })
                    }

                })
            })
    }
    
    function copyAssets() {

        fs.promises.mkdir(path.join(projectFolder, 'assets'), { recursive: true });

        async function copyAllInnerFiles(dir, newDir) {
            // console.log('qwewqeqweqweqw', dir, newDir)
            await fs
                    .promises
                    .readdir((dir), { withFileTypes: true })
                    .then(dirents => {
                        dirents.forEach( async (dirent) => {
                            // console.log(dirent)
                            if (dirent.isDirectory()) {
                                const dirPath = path.join(dir, dirent.name)
                                const newDirPath = path.join(newDir, dirent.name)
                                // console.log('---=== dirPath', dirPath, '===---')
                                // console.log('---=== newDirPath', newDirPath, '===---')

                                copyAllInnerFiles(dirPath, newDirPath)
                            } else {
                                // console.log('---===!!!', newDir, '!!!===---')
                                fs.mkdir(
                                    newDir, 
                                    { recursive: true },
                                    err => {
                                        if (err) throw new Error('There is some problem with directory (folder already exist or not clean)')
                                    }
                                )
                                const filePath = path.join(dir, dirent.name)
                                copyFile(filePath, path.join(newDir, dirent.name))
                                // console.log(dirent.name)
                            }
                            
                        })
            })
        }
        let dir = path.join(__dirname, 'assets')
        let newDir = path.join(__dirname, projectDist, 'assets')
        copyAllInnerFiles(dir, newDir)
        
    }

}) ()





