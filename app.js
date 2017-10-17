require('marko/node-require').install()
require('marko/express')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const indexTemplate = require('./index.marko')
const app = express()

const isProduction = process.env.NODE_ENV === 'production'

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require('lasso').configure({
  plugins: [
    'lasso-marko' // Allow Marko templates to be compiled and transported to the browser
  ],
  outputDir: __dirname + '/static', // Place all generated JS/CSS/etc. files into the "static" dir
  bundlingEnabled: isProduction, // Only enable bundling in production
  minify: isProduction, // Only minify JS and CSS code in production
  fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
})

app.use(require('lasso/middleware').serveStatic());
app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(awsServerlessExpressMiddleware.eventContext())

app.get('/', (req, res) => {
  res.marko(indexTemplate, {
    name: 'Frank',
    count: 30,
    colors: ['red', 'green', 'blue']
  });
})

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app
