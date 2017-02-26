import {EventsEnum as ee} from "../constants";
const HOST = "http://localhost:3333/";

export default class RemoteDataService {

  /**
   * NOTE remember to NOT put slashes after a URL since a '405 method not allowed' will be returned by server
   * @param  {EventEmitter} eventbus
   */
  constructor(eventbus) {
    eventbus.on(ee.PLANLIST_FETCH_CMD, () => {
      this.fetchJson("plans", ee.PLANLIST_FETCH_EVT, ee.PLANLIST_FETCH_ERROR_EVT, eventbus);
    });

    eventbus.on(ee.TRAININGS_FETCH_CMD, () => {
      this.fetchJson("trainings", ee.TRAININGS_FETCH_EVT, ee.TRAININGS_FETCH_ERROR_EVT, eventbus);
    });

    eventbus.on(ee.TRAININGS_PERSIST_CMD, (trainings) => {
      if (trainings !== null) {
        this.persistTrainings(trainings, eventbus);
      }
    });

    eventbus.on(ee.PLAN_FETCH_CMD, (uuid) => {
      this.fetchMultiple([`plans/${uuid}`, `traininginstances/${uuid}`],
        ee.PLAN_FETCH_EVT, ee.PLAN_FETCH_ERROR_EVT, eventbus);
    });

    eventbus.on(ee.PLAN_AND_INSTANCES_PERSIST_CMD, (plan, instances) => {
      this.persistExistingPlan(plan, eventbus);
      this.persistInstances(plan.uuid, instances, eventbus);
    });

    eventbus.on(ee.PLAN_ADD_CMD, plan => this.persistNewPlan(plan, eventbus));
  }

  fetchOne(noun) {
    return new Promise((resolve, reject) => {
      fetch(HOST + noun, { method: "GET" })
      .then(response => resolve(response.json()))
      .catch(error => {
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
      eventbus.emit(succesEvtName, arr);
    }).catch(err => {
      eventbus.emit(errEvtName, err);
    });
  }

  fetchJson(noun, succesEvtName, errEvtName, eventbus) {
    if (typeof fetch == "function") {
      fetch(HOST + noun, {
        method: "GET"
      }).then((response) => {
        response.json().then(function(json) {
          //console.log(json);
          eventbus.emit(succesEvtName, json);
        });
      }).catch((error) => {
        eventbus.emit(errEvtName, error);
      });
    }
  }

  persistTrainings(trainings, eventbus) {
    const trainingsStr = JSON.stringify(trainings, null, "\t");
    if (typeof fetch === "function") {
      fetch("http://localhost:3333/trainings", {
        method: "PUT",
        body: trainingsStr,
      }).then((response) => {
        eventbus.emit(ee.TRAININGS_PERSIST_EVT);
      }).catch((error) => {
        eventbus.emit(ee.TRAININGS_PERSIST_ERROR_EVT, error);
      });
    }
  }

  persistNewPlan(plan, eventbus) {
    const planStr = JSON.stringify(plan, null, "\t");
    if (typeof fetch === "function") {
      fetch(`http://localhost:3333/plans`, {
        method: "POST",
        body: planStr,
      }).then((response) => {
        eventbus.emit(ee.PLAN_ADD_EVT);
      }).catch((error) => {
        eventbus.emit(ee.PLAN_ADD_ERROR_EVT, error);
      });
    }
  }

  persistExistingPlan(plan, eventbus) {
    const planStr = JSON.stringify(plan, null, "\t");
    if (typeof fetch === "function") {
      fetch(`http://localhost:3333/plans/${plan.uuid}`, {
        method: "PUT",
        body: planStr,
      }).then((response) => {
        eventbus.emit(ee.PLAN_PERSIST_EVT);
      }).catch((error) => {
        eventbus.emit(ee.PLAN_PERSIST_ERROR_EVT, error);
      });
    }
  }

  persistInstances(uuid, instances, eventbus) {
    const instancesStr = JSON.stringify(instances, null, "\t");
    if (typeof fetch === "function") {
      fetch(`http://localhost:3333/traininginstances/${uuid}`, {
        method: "PUT",
        body: instancesStr,
      }).then((response) => {
        eventbus.emit(ee.INSTANCES_PERSIST_EVT);
      }).catch((error) => {
        eventbus.emit(ee.INSTANCES_PERSIST_ERROR_EVT, error);
      });
    }
  }

}
