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
      this.fetchMultiple([`plans/${uuid}`, `traininginstances/${uuid}`],
        "PLAN_FETCHED_EVT", "PLAN_FETCH_ERROR_EVT", eventbus);
    });  
    
    eventbus.on("PLAN_AND_INSTANCES_PERSIST_CMD", (plan, instances) => {      
      this.persistPlan(plan);
      this.persistInstances(instances);      
    });
  }

  fetchOne(noun) {
    return new Promise((resolve, reject) => {
      fetch(HOST + noun, {method: "GET"}).then(response => resolve(response.json()));
    });
  }  

  /**
   * fetch Multiple urls in sequence and order
   * @param  {[type]} nouns         [description]
   * @param  {[type]} succesEvtName [description]
   * @param  {[type]} errEvtName    [description]
   * @param  {[type]} eventbus      [description]   
   */
  fetchMultiple(nouns, succesEvtName, errEvtName, eventbus) {
    Promise.all([this.fetchOne(nouns[0]), this.fetchOne(nouns[1])]).then(arr => {
      eventbus.emit(succesEvtName, arr);
    }).catch(err => {
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
  
  persistPlan(plan) {    
    const planStr = JSON.stringify(plan, null, "\t");
    if (typeof fetch == "function") {
      fetch(`http://localhost:3333/plans/${plan.uuid}`, {
        method: "PUT",
        body: planStr
      }).then((response) => {
        this.eventbus.emit("PLAN_PERSIST_EVT");
      }).catch((error) => {
        this.eventbus.emit("PLAN_PERSIST_ERROR_EVT", error);
      });
    }
  }

  persistInstances(instances) {
    const instancesStr = JSON.stringify(instances, null, "\t");
    if (typeof fetch == 'function') {
      fetch(`http://localhost:3333/traininginstances/${uuid}`, {
        method: "PUT",
        body: instancesStr
      }).then((response) => {
        this.eventbus.emit("INSTANCES_PERSIST_EVT");
      }).catch((error) => {
        this.eventbus.emit("INSTANCES_PERSIST_ERROR_EVT", error);
      });
    }
  }

}
