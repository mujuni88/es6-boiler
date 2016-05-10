import elm from 'elements';
// const Observable = require('rx').Observable;
import {Observable} from 'rx';
import $ from 'jquery';


const refreshEl = document.querySelector('.refresh'); 
const closeButton1 = document.querySelector('.close1'); 
const closeButton2 = document.querySelector('.close2'); 
const closeButton3 = document.querySelector('.close3');
 
const close1Clicks = Observable.fromEvent(closeButton1, 'click'); 
const close2Clicks = Observable.fromEvent(closeButton2, 'click');
const close3Clicks = Observable.fromEvent(closeButton3, 'click');
const refreshClickStream = Observable.fromEvent(refreshEl, 'click');
const api = 'https://api.github.com/users';

const startupRequestStream = Observable.just(api);
const requestOnRefreshStream = refreshClickStream
    .map(e => {
        let randomOffset = Math.floor(Math.random()*500);
        return api + '?since='+randomOffset;   
    });
    
const responseStream = requestOnRefreshStream
    .merge(startupRequestStream)
    .flatMap(url => 
        Observable.fromPromise($.getJSON(url))
    ).shareReplay(1);


const suggestion1Stream = createSuggestionStream(responseStream, close1Clicks);
const suggestion2Stream = createSuggestionStream(responseStream, close2Clicks);
const suggestion3Stream = createSuggestionStream(responseStream, close3Clicks);

function getRandomUser(listUsers) {
    return listUsers[Math.floor(Math.random() * listUsers.length)];
}

function createSuggestionStream(responseStream, closeClickStream){
return responseStream
        .map(listUsers =>
            getRandomUser(listUsers)
        )
        .startWith(null)
        .merge(refreshClickStream.map(e => null))
        .merge(
            closeClickStream.withLatestFrom(responseStream, (ev, listUsers) => getRandomUser(listUsers))
        );
}

function renderUser(data, selector) {
    let elm = document.querySelector(selector);
    
    if(!data){
        elm.style.visibility = 'hidden';    
    } else {
        elm.style.visibility = 'visible';

        let imgEl = elm.querySelector('img');
        imgEl.src = data.avatar_url;

        let userEl = elm.querySelector('.username');
        userEl.href = data.url;
        userEl.textContent = data.login;
    }
}

suggestion1Stream.subscribe(user => {
    renderUser(user, '.suggestion1');
}, (err) => console.error(err));

suggestion2Stream.subscribe(user => {
    renderUser(user, '.suggestion2');
}, (err) => console.error(err));

suggestion3Stream.subscribe(user => {
    renderUser(user, '.suggestion3');
}, (err) => console.error(err));
