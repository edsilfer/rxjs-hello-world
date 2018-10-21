const GITHUB_API = 'https://api.github.com/users';
const MAX_SUGGESTIONS = 3;

function main() {
  let users = $('#users');
  let refreshButton = $('#refresh');
  let userRemovedStream = new Rx.Subject();

  let requestStream = Rx.Observable
    .of(`${GITHUB_API}?since=${randomNumber()}`)
    .mergeMap(url => {
      console.log(`performing request to: ${url}`)
      return Rx.Observable.from(jQuery.getJSON(url))
    })
    .publishLast();

  let refreshStream = Rx.Observable.fromEvent(refreshButton, 'click')
    .startWith('click')
    .do(_ => users.empty())
    .combineLatest(requestStream, (_, users) => users.slice(randomNumber(users.length)));

  let randomUserStream = userRemovedStream
    .combineLatest(requestStream, (_, users) => users[randomNumber(users.length)]);

  requestStream
    .merge(refreshStream)
    .flatMap(users => users)
    .merge(randomUserStream)
    .filter(_ => users.children().length < MAX_SUGGESTIONS)
    .do(user => users.append(createItem(user)))
    .mergeMap(user => Rx.Observable.fromEvent($(`#close-${user.login}`), 'click'))
    .map(event => event.target.parentNode)
    .subscribe(user => {
      $(user).addClass('effect');
      userRemovedStream.next('');
    });

  requestStream.connect();
}

function randomNumber(limit = 500) {
  return Math.floor(Math.random() * limit);
}

function createItem(user) {
  return $(`
    <li id="user-${user.login}" class="item-wrapper" >
      <img src="${user.avatar_url}" class="rounded-circle" width="50" height="50">

      <div class="item-infos-wrapper">
        <h2 class="font-weight-bold">${user.login}</h2>
        <p class="font-weight-normal">What can we put in here?</p>
      </div>

      <button id="close-${user.login}" type="button" class="btn btn-outline-danger btn-sm item-action">remove<i class="material-icons">highlight_off</i></button>
    </li>
  `);
}

main();

