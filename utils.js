function randomNumber(limit = 500) {
  return Math.floor(Math.random() * limit);
}

function createSuggestion(user) {
  return $(`
    <li id="user-${user.login}">
      <img src="${user.avatar_url}" class="rounded-circle" width="50" height="50">

      <div class="item-infos-wrapper">
        <h2>${user.login}</h2>
        <p>Add user bio in here...</p>
      </div>

      <div class="item-button-container">
        <a class="item-button" href="https://github.com/${user.login}">GitHub</a>
        <a class="item-button remove" id="close-${user.login}">remove</a>
      </div>
    </li>
  `);
}