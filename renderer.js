const path = require('path')
const util = require('util')
const fs = require('fs')

const lstat = util.promisify(fs.lstat)
const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

Vue.component('listing', {
    props: ['item'],
    template: '<div class="listing-item" @click="clicked(item.name)">{{ item.name }}</div>',
    methods: {
        clicked(n) {
            go(path.format({ dir: app.location, base: n }))
        }
    }
})

const app = new Vue({
    el: '#app',
    data: {
        location: process.cwd(),
        files: [],
        tmpFiles: [],
        image: null,
        fileContent: null
    },
    methods: {
        up () {
            go(path.dirname(this.location))
        },
        filterCurrentFiles ({ currentTarget: { value }}) {
           if (!value) {
               this.files = this.tmpFiles
           } else {
               this.files = this.files.filter((file) => file.name.indexOf(value) > -1)
           }
        }
    }
})

async function go(currentPath) {
    if(currentPath.endsWith('.bpm') || currentPath.endsWith('.png') || currentPath.endsWith('.gif') || currentPath.endsWith('.jpg')) {
        app.image = 'file://' + currentPath
    } else {
        app.image = null
        app.fileContent = null
        app.files = []
        app.tmpFiles = []

        try {
            const stat = await lstat(currentPath)

            if (stat.isDirectory()) {
                app.location = currentPath

                const files = await readdir(app.location)
                for(let i = 0; i < files.length; i++) {
                    app.files.push({ id: i, name: files[i] })
                    app.tmpFiles.push({ id: i, name: files[i] })
                }
            } else {
                app.fileContent = await readFile(currentPath, 'utf8')
            }
        } catch (e) {
            console.log(e)
        }
    }
}