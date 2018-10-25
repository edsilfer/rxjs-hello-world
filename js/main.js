const GITHUB_API = "https://api.github.com/users";

function main() {
  // TODO: decouple component
}

function createRequestStream() {
  let url = `${GITHUB_API}?since=${randomNumber()}`;
  return Rx.Observable.of(url)
    .mergeMap(url => Rx.Observable.from(jQuery.getJSON(url)))
    .publishLast();
}

main()