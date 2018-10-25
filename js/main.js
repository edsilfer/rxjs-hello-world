const GITHUB_API = "https://api.github.com/users";
const MAX_SUGGESTIONS = 3;

function main() {
  Rx.Observable.of(`${GITHUB_API}?since=${randomNumber()}`)
    .mergeMap(url => Rx.Observable.from(jQuery.getJSON(url)))
    .flatMap(users => users)
    .map(user => {
      return {
        'header': user.login,
        'subheader': 'What to put in here?',
        'thumbnail': user.avatar_url
      };
    })
    .toArray()
    .subscribe(users => createWidget($('#users'), MAX_SUGGESTIONS, users));
}

main();