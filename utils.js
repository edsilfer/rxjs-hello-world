function randomNumber(limit = 500) {
  return Math.floor(Math.random() * limit);
}

function createSuggestion(user) {
  return $(`
    <li id="user-${user.login}">
      <img src="${user.avatar_url}" class="rounded-circle" width="50" height="50">

      <div class="item-infos-wrapper">
        <h2 class="font-weight-bold">${user.login}</h2>
        <p class="font-weight-normal">What can we put in here?</p>
      </div>

      <button id="close-${user.login}" type="button" class="btn btn-outline-danger btn-sm">remove</button>
    </li>
  `);
}