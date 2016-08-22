import EventEmitter from "eventemitter2";

const HOST = "http://localhost:3333/";

/**
 * Handles communication with rest-api
 * @param { EventEmitter2 } [eventbus] [can communicate with rest of app]
 */
export default function loadRemoteData(eventbus) {
	fetchJson("trainings", "TRAININGS_FETCHED_EVT", "TRAININGS_FETCH_ERROR_EVT", eventbus);
	fetchJson("plans", "PLANS_FETCHED_EVT", "PLANS_FETCH_ERROR_EVT", eventbus);
	fetchJson("traininginstances", "TRAININGINSTANCES_FETCHED_EVT", "TRAININGINSTANCES_FETCH_ERROR_EVT", eventbus);
}

const fetchJson = (noun, succesEvtName, errEvtName, eventbus) => {
	console.log(`fetching ${noun}`);
	if (typeof fetch == "function") {
    fetch(HOST + noun, {
      method: "GET"
    }).then((response) => {
    	response.json().then(function (json) {
  			//console.log(json);
  			console.log(`succes fetching ${noun} with data ${JSON.stringify(json).substring(0, 100)}`);
      	eventbus.emit(succesEvtName, json);
			});    	
    }).catch((error) => {
    	console.log(`error when fetching ${noun} with ${error}`);
      eventbus.emit(errEvtName, error);
    });
  }
}
