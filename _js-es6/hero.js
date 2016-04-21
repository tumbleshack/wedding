// hero.js

var localVariable = 123; // not visible outside this file

export default function Hero(age) {
  setTimeout(() => { console.log(localVariable); }, 1000);
};
