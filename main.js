const GITHUB_API = 'https://api.github.com/users';
const MAX_SUGGESTIONS = 3;
var SUGGESTED_USERS = [];

function main() {
  let users = $('#users');
  let refreshButton = $('#refresh');
  let userRemovedStream = new Rx.Subject();

  let requestStream = Rx.Observable
    .of(`${GITHUB_API}?since=${randomNumber()}`)
    .mergeMap(url => {
      SUGGESTED_USERS = [];
      return Rx.Observable.from(jQuery.getJSON(url))
    })
    .publishLast();

  let refreshStream = Rx.Observable.fromEvent(refreshButton, 'click')
    .startWith('click')
    .do(_ => users.empty())
    .combineLatest(requestStream, (_, users) => users.slice(randomNumber(users.length)));

  let randomUserStream = userRemovedStream
    .combineLatest(requestStream, (_, users) => {
      let randomUser = users[randomNumber(users.length)];
      let maxAttempts = 100;
      let count = 0;
      while (SUGGESTED_USERS.indexOf(randomUser.login) > -1 && count <= maxAttempts) {
        randomUser = users[randomNumber(users.length)];
        count++;
      }
      return randomUser;
    });

  requestStream
    .merge(refreshStream)
    .flatMap(users => users)
    .merge(randomUserStream)
    .filter(_ => users.children().length < MAX_SUGGESTIONS)
    .do(user => { users.append(createItem(user)); })
    .delay(10)
    .do(user => { $(`#user-${user.login}`).addClass('show') })
    .mergeMap(user => Rx.Observable.fromEvent($(`#close-${user.login}`), 'click'))
    .map(event => event.target.parentNode)
    .subscribe(user => {
      $(user).removeClass('show');
      setTimeout(() => {
        user.remove();
        userRemovedStream.next('');
      }, 250);
    });

  requestStream.connect();
}

function randomNumber(limit = 500) {
  return Math.floor(Math.random() * limit);
}

function createItem(user) {
  SUGGESTED_USERS.push(user.login);
  return $(`
    <li id="user-${user.login}">
      <img src="${user.avatar_url}" class="rounded-circle" width="50" height="50">

      <div class="item-infos-wrapper">
        <h2 class="font-weight-bold">${user.login}</h2>
        <p class="font-weight-normal">What can we put in here?</p>
      </div>

      <button id="close-${user.login}" type="button" class="btn btn-outline-danger btn-sm">remove<i class="material-icons">highlight_off</i></button>
    </li>
  `);
}

main();

