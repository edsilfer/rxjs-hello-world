const GITHUB_API = "https://api.github.com/users";
const MAX_SUGGESTIONS = 3;
const ANIMATION_DURATION = 250;

var suggested = [];

function main() {
  let users = $("#users");

  let suggestionRemovedStream = new Rx.Subject();
  let requestSuggestionsStream = createRequestStream();
  let refreshSuggestionsStream = createRefreshSuggestionsStream(
    users,
    requestSuggestionsStream
  );
  let randomSuggestionStream = createRandomSuggestionStream(
    suggestionRemovedStream,
    requestSuggestionsStream
  );
  let addSuggestionStream = createAddSuggestionStream(
    requestSuggestionsStream,
    refreshSuggestionsStream,
    randomSuggestionStream,
    users
  );

  addSuggestionStream
    .delay(10)
    .do(user => {
      $(`#user-${user.login}`).addClass("show");
    })
    .mergeMap(user =>
      Rx.Observable.fromEvent($(`#close-${user.login}`), "click")
    )
    .map(event => event.target.parentNode)
    .do(user => $(user).removeClass("show"))
    .delay(ANIMATION_DURATION)
    .do(user => user.remove())
    .subscribe(_ => suggestionRemovedStream.next(""));

  requestSuggestionsStream.connect();
}

function createRequestStream() {
  return Rx.Observable.of(`${GITHUB_API}?since=${randomNumber()}`)
    .do(_ => (suggested = []))
    .mergeMap(url => Rx.Observable.from(jQuery.getJSON(url)))
    .publishLast();
}

function createRefreshSuggestionsStream(users, requestStream) {
  return Rx.Observable.fromEvent($("#refresh"), "click")
    .startWith("click")
    .do(_ => users.empty())
    .combineLatest(requestStream, (_, users) =>
      users.slice(randomNumber(users.length))
    );
}

function createRandomSuggestionStream(suggestionRemovedStream, requestStream) {
  return suggestionRemovedStream.combineLatest(requestStream, (_, users) => {
    let randomSuggestion = users[randomNumber(users.length)];
    let maxAttempts = 100;
    let count = 0;
    while (
      suggested.indexOf(randomSuggestion.login) > -1 &&
      count <= maxAttempts
    ) {
      randomSuggestion = users[randomNumber(users.length)];
      count++;
    }
    return randomSuggestion;
  });
}

function createAddSuggestionStream(
  requestStream,
  refreshStream,
  randomSuggestionStream,
  users
) {
  return requestStream
    .merge(refreshStream)
    .flatMap(users => users)
    .merge(randomSuggestionStream)
    .filter(_ => users.children().length < MAX_SUGGESTIONS)
    .do(user => {
      suggested.push(user.login);
      users.append(createSuggestion(user));
    });
}

main();
