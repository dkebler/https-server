// const express = require('express');
const url = require('url'),
  path = require('path'),
  fs = require('fs'),
  https = require('https'),
  http = require('http')

const _ = require('./config')

const host = _.hostname ? _.hostname : _.cert.name

const options = {
  key: fs.readFileSync(_.cert.path + _.cert.name + '.key'),
  cert: fs.readFileSync(_.cert.path + _.cert.name + '.crt'  )
}
if (_.ca) {
  options.ca = fs.readFileSync(_.cert.path + _.cert.inter + '.crt' )
}

http.createServer(redirect).listen(_.httpPort ? _.httpPort : 8080 )
https.createServer(options, handler).listen(_.httpsPort ? _.httpsPort : 8443 )

function redirect (request, response) {
  let redirect = 'https://' + host + request.url
  console.log('redirect to: ',redirect)
  // response.writeHead(302,  {Location: 'https://' + request.headers.host + request.url})
  response.writeHead(302,  {Location: redirect})
  response.end()
}


function handler (request, response) {
  console.log('handler')

  let webroot = _.webRoot ? _.webRoot : process.cwd()

  let uri = url.parse(request.url).pathname
    , filename = path.join(webroot, uri)

  fs.stat(filename, function(err,stats) {
    if (err) {
      response.writeHead(404, {'Content-Type': 'text/plain'})
      response.write('404 Not Found\n')
      response.end()
      return
    }

    if (stats.isDirectory()) filename += '/index.html'

    console.log('process request', uri,filename)

    fs.readFile(filename, 'binary', function(err, file) {
      if(err) {
        response.writeHead(500, {'Content-Type': 'text/plain'})
        response.write(err + '\n')
        response.end()
        return
      }
      response.writeHead(200)
      response.write(file, 'binary')
      response.end()
    })
  })
}
