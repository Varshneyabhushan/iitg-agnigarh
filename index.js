const nodefetch = require("node-fetch")
const https = require("https")
const cheerio = require('cheerio')
const pid = process.pid

require('dotenv').config()

function fetch(url, body = {}) {
    body.agent = new https.Agent({ rejectUnauthorized: false })
    return nodefetch(url, body)
}

const domainName = "https://agnigarh.iitg.ac.in:1442"
const refreshURL = `${domainName}/login?abcd`

let username = process.env.USERNAME
let password = process.env.PASSWORD
let timeout = process.env.TIMEOUT

if(!username || !password){
    logOutput("specify username and password in .env file")
}else if(!timeout){
    logError("specify timeout in .env file")
}else 
    fetch(refreshURL).then(r => r.text())
    .then(res => {
        let dom = cheerio.load(res)
        let magic = dom("input[name='magic']")[0].attribs.value
        let body = `magic=${magic}&username=${username}&password=${password}`
        return fetch(domainName, { body, "method": "POST" })
    })
    .then(res => res.text())
    .then(res => res.length > 2000 ? Promise.reject({ message: "error occurred." }) : res)
    .then(_ => {
        logOutput("connection established.")
        timeOut = setInterval(_ => {
            fetch(refreshURL).then(_=>logOutput("connection re-established."))
                .catch(err => {
                    clearInterval(timeOut)
                    logError("could not refresh, " +  err.message)
                })
        }, timeout * 1000)
    })
    .catch(err => logError(err.message))

function logOutput(msg){
    console.log(`${pid}#${new Date()}:output => ${msg}`)
}

function logError(msg){
    console.log(`${pid}#${new Date()}:error => ${msg}`)
}