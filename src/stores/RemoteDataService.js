import EventEmitter from "eventemitter2";

const HOST = "http://localhost:3333/";

export default class RemoteDataService {

  /**   
   * 
   * @param  {EventEmitter} eventbus   
   */
  constructor(eventbus) {
    eventbus.on("PLANLIST_FETCH_CMD", () => {
      this.fetchJson("plans", "PLANLIST_FETCHED_EVT", "PLANLIST_FETCH_ERROR_EVT", eventbus);
    });

    eventbus.on("TRAININGS_FETCH_CMD", () => {
      this.fetchJson("trainings", "TRAININGS_FETCHED_EVT", "TRAININGS_FETCH_ERROR_EVT", eventbus);
    });

    eventbus.on("PLAN_FETCH_CMD", (uuid) => {
      console.log(`RemoteDataService PLAN_FETCH_CMD ${uuid}`);
      this.fetchMultiple([`plans/${uuid}`, `traininginstances/${uuid}`],
        "PLAN_FETCHED_EVT", "PLAN_FETCH_ERROR_EVT", eventbus);
    });

    eventbus.on("PLAN_AND_INSTANCES_PERSIST_CMD", (plan, instances) => {
      this.persistPlan(plan, eventbus);
      this.persistInstances(plan.uuid, instances, eventbus);
    });
  }

  fetchOne(noun) {
    return new Promise((resolve, reject) => {
      fetch(HOST + noun, { method: "GET" })
      .then(response => resolve(response.json()))
      .catch(error => {
        console.log(`error when fetching ${noun} with ${error}`);
        eventbus.emit(errEvtName, error);
      });
    });
  }

  /**
   * fetch Multiple urls in sequence and order
   * @param  {[type]} nouns         rest-api noun or url
   * @param  {[type]} succesEvtName what eventname to put on the bus when SUCCES happens?
   * @param  {[type]} errEvtName    what eventname to put on the bus when ERROR happens?
   * @param  {[type]} eventbus      shared eventbus
   */
  fetchMultiple(nouns, succesEvtName, errEvtName, eventbus) {
    Promise.all([this.fetchOne(nouns[0]), this.fetchOne(nouns[1])]).then(arr => {
      console.log(`RemoteDataService fetchMultiple OK emitting ${succesEvtName}`);
      eventbus.emit(succesEvtName, arr);
    }).catch(err => {
      console.log(`RemoteDataService fetchMultiple ERROR emitting ${errEvtName}: ${err}`);
      eventbus.emit(errEvtName, err);
    });
  }

  fetchJson(noun, succesEvtName, errEvtName, eventbus) {
    console.log(`fetching ${noun}`);
    if (typeof fetch == "function") {
      fetch(HOST + noun, {
        method: "GET"
      }).then((response) => {
        response.json().then(function(json) {
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

  persistPlan(plan, eventbus) {
    const planStr = JSON.stringify(plan, null, "\t");
    if (typeof fetch == "function") {
      fetch(`http://localhost:3333/plans/${plan.uuid}`, {
        method: "PUT",
        body: planStr
      }).then((response) => {
        eventbus.emit("PLAN_PERSIST_EVT");
      }).catch((error) => {
        eventbus.emit("PLAN_PERSIST_ERROR_EVT", error);
      });
    }
  }

  persistInstances(uuid, instances, eventbus) {
    const instancesStr = JSON.stringify(instances, null, "\t");
    console.log(`RemoteDataService persistInstances: ${instancesStr}`);
    if (typeof fetch == 'function') {
      fetch(`http://localhost:3333/traininginstances/${uuid}`, {
        method: "PUT",
        body: instancesStr
      }).then((response) => {
        eventbus.emit("INSTANCES_PERSIST_EVT");
      }).catch((error) => {
        eventbus.emit("INSTANCES_PERSIST_ERROR_EVT", error);
      });
    }
  }

}
