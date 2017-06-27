import {EventsEnum as ee} from "./constants";
const HOST = "http://localhost:3333/";

/**
 * NOTE remember to NOT put slashes after a URL since a '405 method not allowed'
 *  will be returned by server
 * @param  {EventEmitter} eventbus - handles intra-component communication
 * @returns {remoteDataService} remoteDataService - itself
 */
const remoteDataService = (eventbus) => {
  eventbus.on(ee.PLANLIST_FETCH_CMD, () => {
    fetchJson("plans", ee.PLANLIST_FETCH_EVT, ee.PLANLIST_FETCH_ERROR_EVT);
  });

  eventbus.on(ee.TRAININGS_FETCH_CMD, () => {
    fetchJson("trainings", ee.TRAININGS_FETCH_EVT, ee.TRAININGS_FETCH_ERROR_EVT);
  });

  eventbus.on(ee.TRAININGS_PERSIST_CMD, (trainings) => {
    if (trainings !== null) {
      persistTrainings(trainings);
    }
  });

  eventbus.on(ee.PLAN_FETCH_CMD, (uuid) => {
    fetchMultiple([`plans/${uuid}`, `traininginstances/${uuid}`],
      ee.PLAN_FETCH_EVT, ee.PLAN_FETCH_ERROR_EVT);
  });

  eventbus.on(ee.PLAN_AND_INSTANCES_PERSIST_CMD, (plan, instances) => {
    persistExistingPlan(plan);
    persistInstances(plan.uuid, instances);
  });

  eventbus.on(ee.PLAN_ADD_CMD, plan => persistNewPlan(plan));

  const fetchOne = (noun) => {
    return new Promise((resolve, reject) => {
      fetch(HOST + noun, {method: "GET"})
        .then(response => resolve(response.json()))
        .catch(error => {
          eventbus.emit("FETCH_ERROR_EVT", error);
        });
    });
  };

  /**
   * fetch Multiple urls in sequence and order
   * @param  {[type]} nouns         rest-api noun or url
   * @param  {[type]} succesEvtName what eventname to put on the bus when SUCCES happens?
   * @param  {[type]} errEvtName    what eventname to put on the bus when ERROR happens?
   * @param  {[type]} eventbus      shared eventbus
   * @returns {void} - emit event instead
   */
  const fetchMultiple = (nouns, succesEvtName, errEvtName) => {
    Promise.all([fetchOne(nouns[0]), fetchOne(nouns[1])]).then(arr => {
      eventbus.emit(succesEvtName, arr);
    }).catch(err => {
      eventbus.emit(errEvtName, err);
    });
  };

  const fetchJson = (noun, succesEvtName, errEvtName) => {
    if (typeof fetch === "function") {
      fetch(HOST + noun, {
        method: "GET"
      }).then((response) => {
        response.json().then(function (json) {
          //console.log(json);
          eventbus.emit(succesEvtName, json);
        });
      }).catch((error) => {
        eventbus.emit(errEvtName, error);
      });
    }
  };

  const persistTrainings = (trainings) => {
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
  };

  const persistNewPlan = (plan) => {
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
  };

  const persistExistingPlan = (plan) => {
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
  };

  const persistInstances = (uuid, instances) => {
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
  };

  return {}; // public
};

export default remoteDataService;
