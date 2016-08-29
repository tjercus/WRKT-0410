import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";
import {
  clone,
  createUuid
} from "./miscUtil";
import pureSwap from "pure-swap";

/**
 * Return a plan
 */
export function findPlan(uuid, plans, trainingInstances) {
  //console.log(`timelineUtil.findPlan: ${JSON.stringify(trainingInstances[0])}`);
  if (uuid === null || uuid.length !== 36) {
    throw new Error(`findPlan says uuid is not ok: ${uuid}`);
  }
  if (plans === null || plans.length === 0) {
    throw new Error(`findPlan requires a plan`);
  }
  if (trainingInstances === null || trainingInstances.length === 0) {
    throw new Error(`findPlan trainingInstances required`);
  }
  const _plans = clone(plans);
  const _trainings = clone(trainingInstances);
  console.log(`len: ${plans.length} plans[0].uuid: ${_plans[0].uuid}`);
  let plan = _plans.find((_plan) => {
    if (_plan.uuid == uuid) return _plan;
  });
  let _days = [];
  if (plan === null || plan === undefined) {
    throw new Error(`plan not found ${uuid}`);
  }
  console.log(`plan ${JSON.stringify(plan)}`);
  plan.days.forEach((_day, i) => {
    _days.push(augmentDay(_day, _trainings));
  });
  plan.days = _days;
  return plan;
}

export function findDay(dayUuid, plan, trainings) {
  if (trainings.length === 0) {
    throw new Error(`trainings should be provided!`);
  }
  if (!plan.days || plan.days.length === 0) {
    throw new Error(`plan should have a list of days!`);
  }
  const _days = clone(plan.days);
  const _trainings = clone(trainings);
  let found = null;
  _days.forEach((_day, j) => {
    if (_day["uuid"] == dayUuid) {
      console.log(`findDay ${JSON.stringify(_day)}`);
      found = augmentDay(_day, _trainings);
    }
  });
  return found;
}

/**
 * lookup training for a day by uuid and add it to itself
 * @param { object } [day] [flattened day object with ref to inflated day]
 * @param { array<TrainingInstance> } [trainings] [list of augmented TrainingInstance ojects]
 * @return { array<Day> } [description]
 */
export function augmentDay(day, trainings) {
  if (trainings.length === 0) {
    throw new Error(`traininginstances should be provided!`);
  }
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.instanceId === "string") ? _day.instanceId : null;
  if (_day.hasOwnProperty("trainings")) {
    // calculate total per training when multiple trainings
    for (let i = 0, len = _day.trainings.length; i < len; i++) {
      _day.trainings[i] = findTraining(_day.trainings[i].instanceId, _trainings);
      _day.trainings[i].total = makeTrainingTotal(_day.trainings[i].segments);
    }
  } else {
    _day.training = findTraining(uuid, _trainings);
    if (_day.training === null) {
      throw new Error(`training not found ${uuid} for day ${day.uuid}`);
    }
    _day.training.total = makeTrainingTotal(_day.training.segments);
  }
  return _day;
}

/**
 * Takes an array of augmented days and flattens it so there are only
 *  references to instances instead of full traininginstance.
 * @param  {array<Day>} augmented
 * @return {array<Day>} flattened
 */
export function flattenDays(days) {
  const _days = clone(days);
  const flattenedDays = [];
  _days.forEach((_day, j) => {
    // support multiple
    if (_day.hasOwnProperty("trainings")) {
      let flattenedTrainings = [];
      for (let i = 0, len = _day.trainings.length; i < len; i++) {
        flattenedTrainings.push({ instanceId: _day.trainings[i].instanceId });
      }
      flattenedDays.push({ uuid: _day.uuid, trainings: flattenedTrainings });
    } else {
      flattenedDays.push({ uuid: _day.uuid, instanceId: _day.training.uuid });
    }
  });
  return flattenedDays;
}

export function removeTrainingsFromDay(dayUuid, days) {
  let _days = clone(days);
  const isDay = (_day) => {
    return _day.uuid == dayUuid;
  }
  const index = _days.findIndex(isDay);
  if (index > -1) {
    if (_days[index].hasOwnProperty("trainings")) {
      const newTrainings = [];
      // TODO for now hardcoded to 2 trainings per day
      newTrainings.push(createNullTraining());
      newTrainings.push(createNullTraining());
      _days[index].trainings = newTrainings;
    } else {
      _days[index].training = createNullTraining();
    };
  }
  return _days;
}

/**
 * Move a day in a list of days by x positions
 * @param  {String} dayUuid, unique id for a day
 * @param  {Array<Day>} days
 * @param  {int} positions, where a positive means 
 *  move later in time and a negative means move to an earlier spot
 * @return {Array<Day>} days, list of resorted days
 */
export function moveDay(dayUuid, days, positions) {
  let _days = clone(days);
  const isDay = (_day) => {
    return _day.uuid == dayUuid;
  }
  const index = _days.findIndex(isDay);
  if (index > -1) {
    return pureSwap(_days, index, index + positions);
  }
}

export function cloneDay(oldDay) {
  const newDay = clone(oldDay);
  newDay.uuid = createUuid();
  if (oldDay.hasOwnProperty("trainings")) {
    let clonedTrainings = [];
    // TODO replace forloop
    for (let i = 0, len = oldDay.trainings.length; i < len; i++) {
      const newInstanceUuid = createUuid();
      const newTraining = clone(oldDay.trainings[i]);
      newTraining.uuid = newInstanceUuid;
      clonedTrainings.push(newTraining);
    }
    newDay.trainings = clonedTrainings;
  } else {
    const newInstanceUuid = createUuid();
    const newTraining = clone(oldDay.training);
    newTraining.uuid = newInstanceUuid;
    newDay.training = newTraining;
  }  
  return newDay
}

export function deleteDay(dayUuid, days) {
  let _days = clone(days);
  const isDay = (_day) => {
    return _day.uuid == dayUuid;
  }
  const index = _days.findIndex(isDay);
  if (index > -1) {
    _days.splice(index, 1);
  }
  return _days;
}

const createNullTraining = () => {
  return {
    uuid: createUuid(),
    name: "No Run",
    distance: 0,
    duration: "00:00:00",
    pace: "00:00",
    type: "",
    total: { distance: 0, duration: "00:00:00", pace: "00:00" }
  }
}
