#!/usr/bin/env node

var finder = require('findit')(process.argv[2] || process.env.HOME);
var path = require('path');
var uniq = require('lodash').uniq;
var sortBy = require('lodash').sortBy;
var results = {}

finder.on('directory', function (dir, stat, stop) {
  var base = path.basename(dir);
  if (base.match(/^\./) || base === 'node_modules') stop()
});

finder.on('file', function (file, stat) {
  if (!file.match(/package\.json$/)) return
  var pkg
  try { pkg = require(file) } catch(e) {}
  if (!pkg) return
  if (!pkg.dependencies) return
  if (typeof pkg.dependencies !== "object") return
  var names = Object.keys(pkg.dependencies)
  if (!Array.isArray(names)) return
  names.forEach(function(name){
    var version = pkg.dependencies[name]
    if (results[name]) {
      results[name].count++
      results[name].versions.push(version)
      results[name].versions = uniq(results[name].versions)
    } else {
      results[name] = {
        name: name,
        count: 1,
        versions: [version]
      }
    }
  })
});

finder.on('end', function () {
  var winners = sortBy(results, 'count')
    .reverse()
    .slice(0,50)
  winners.forEach(function(winner) {
    console.log("%s (%s)", winner.name, winner.count)
  })
})
