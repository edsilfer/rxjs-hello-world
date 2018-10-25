function randomNumber(limit = 500) {
  return Math.floor(Math.random() * limit);
}

function random(list) {
  return list[randomNumber(list.length)];
}

