'use strict'
// A helper package for loading browser components.

const fs = require('fs')
const minifier = require('minifier')
const less = require('less')
const path = require('path')

const publicBC = path.join('/bower_components')
const publicFolder = '/public'
const publicJS = path.join(publicFolder, 'js')
const publicCSS = path.join(publicFolder, 'css')
const publicModules = path.join(publicFolder, 'modules')
exports.publicFolder = publicFolder
exports.publicBC = publicBC
exports.publicJS = publicJS
exports.publicCSS = publicCSS
exports.publicModules = publicModules

exports.awesomeCheckboxCSS = path.join(publicCSS, 'awesome-bootstrap-checkbox.min.css')

exports.bootstrapValidatorJS = path.join(publicCSS, 'validator.min.js')

const formhelpersDir = path.join(publicBC, 'bootstrap-formhelpers/dist')
exports.formHelpers = {
  js: path.join(formhelpersDir, 'js/bootstrap-formhelpers.min.js'),
  css: path.join(formhelpersDir, 'css/bootstrap-formhelpers.min.css')
}

const pickadateDir = path.join(publicBC, 'pickadate/lib/compressed')
exports.pickadate = {
  base: {
    js: path.join(pickadateDir, 'picker.js'),
    css: path.join(pickadateDir, 'themes/default.css')
  },
  time: {
    js: path.join(pickadateDir, 'picker.time.js'),
    css: path.join(pickadateDir, 'themes/default.time.css')
  }
}

// helper func to compile less files to CSS
const compileLess = function (lessIn, cssOut) {
  less.render(fs.readFileSync(lessIn).toString(), {
    filename: path.resolve(lessIn)
  }, function (err, output) {
    if (err) {
      throw err
    }
    fs.writeFile(cssOut, output.css, function (err) {
      if (err) {
        throw err
      }
      console.log('Compilation of ' + lessIn + ' completed!')
    })
  })
}
// handle minification errors
minifier.on('error', function (err) {
  if (err) {
    console.log('An error occured minifying.')
    throw err
  }
})

// awesome-bootstrap-checkbox Minification
const abcBigFile = path.join(__dirname, '..', '/bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css')

exports.compileAndMinify = function () {
  // Compile awesomeCheckboxCSS
  minifier.minify(abcBigFile, {
    output: path.join(
      __dirname,
      '..',
      exports.awesomeCheckboxCSS
    )
  })
}
