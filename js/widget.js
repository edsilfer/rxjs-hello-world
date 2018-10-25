const ANIMATION_DURATION = 250;

var suggested = [];

function createWidget(parent, max, items) {
  let income = Rx.Observable.of(items);
  let removed = new Rx.Subject();
  let refresh = refreshStream(parent, income);

  addItemStream(parent, income, refresh, removed, max)
    .delay(10)
    .do(item => $(`#item-${item.header}`).addClass("show"))
    .mergeMap(item => Rx.Observable.fromEvent($(`#close-${item.header}`), "click"))
    .map(event => event.target.parentNode.parentNode)
    .do(item => $(item).removeClass("show"))
    .delay(ANIMATION_DURATION)
    .do(item => item.remove())
    .subscribe(_ => removed.next(random(items)));
}

function refreshStream(items, requestStream) {
  return Rx.Observable.fromEvent($("#refresh"), "click")
    .startWith("click")
    .do(_ => items.empty())
    .combineLatest(requestStream, (_, suggestions) =>
      suggestions.slice(randomNumber(suggestions.length))
    );
}

function addItemStream(parent, income, refresh, remove, max) {
  return income
    .merge(refresh)
    .flatMap(items => items)
    .merge(remove)
    .filter(_ => parent.children().length < max)
    .do(item => suggested.push(item.header))
    .do(item => parent.append(createItem(item)));
}

function createItem(item) {
  return $(`
    <li id="item-${item.header}">
      <img src="${item.thumbnail}" class="rounded-circle" width="50" height="50">

      <div class="item-infos-wrapper">
        <h2>${item.header}</h2>
        <p>Add user bio in here...</p>
      </div>

      <div class="item-button-container">
        <a class="item-button" href="https://github.com/${item.header}">GitHub</a>
        <a class="item-button remove" id="close-${item.header}">Remove</a>
      </div>
    </li>
  `);
}