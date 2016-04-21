"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Hero;
// hero.js

var localVariable = 123; // not visible outside this file

function Hero(age) {
  setTimeout(function () {
    console.log("ES2015 FTW");
  }, 1000);
};