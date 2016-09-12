import {
  findTraining,
  makeTrainingTotal
} from "./trainingUtil";
import {
  clone,
  createUuid
} from "./miscUtil";
import pureSwap from "pure-swap";

export function findDay(dayUuid, plan, trainings) {
  console.log(`findDay: ${dayUuid}`);
  if (trainings.length === 0) {
    throw new Error(`findDay trainings should be provided!`);
  }
  if (!plan.days || plan.days.length === 0) {
    throw new Error(`findDay plan should have a list of days!`);
  }
  const _days = clone(plan.days);
  const isDay = (_day) => _day.uuid == dayUuid;
  const index = _days.findIndex(isDay);
  if (index < 0) {
    throw new Error(`findDay could not find day with ${dayUuid}`);
  }
  return augmentDay(_days[index], clone(trainings));
}

/**
 * lookup training for a day by uuid and add it to itself
 * @param { object } [day] [flattened day object with ref to inflated day]
 * @param { array<TrainingInstance> } [trainings] [list of augmented TrainingInstance ojects]
 * @return { array<Day> } [description]
 */
export function augmentDay(day, trainings) {
  console.log(`augmentDay: ${JSON.stringify(day)}`);
  if (trainings.length === 0) {
    throw new Error(`traininginstances should be provided!`);
  }
  const _day = clone(day);
  const _trainings = clone(trainings);
  let uuid = (typeof _day.instanceId === "string") ? _day.instanceId : null;

  if (!_day.hasOwnProperty("trainings")) {
    _day.trainings = [];
    _day.trainings.push({ instanceId: uuid });
  }

  // ex:
  // const newTrainings = _day.trainings.map((_training) => {
  //   let trainings = [];
  //   trainings.push(findTraining(_training.instanceId, _trainings));
  //   trainings.total = makeTrainingTotal(_training.segments);
  //   return trainings;
  // });
  // calculate total per training when multiple trainings
  for (let i = 0, len = _day.trainings.length; i < len; i++) {
    console.log(`augmentDay trying to find a training by instanceId: 
      [${_day.trainings[i].instanceId}] it also has uuid [${_day.trainings[i].uuid}]`);
    if (!isAugmented(_day.trainings[i])) { 
      _day.trainings[i] = findTraining(_day.trainings[i].instanceId, _trainings);
    }
    console.log(`augmentDay making total for a training ${JSON.stringify(_day.trainings[i])}`);
    _day.trainings[i].total = makeTrainingTotal(_day.trainings[i].segments);
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
  console.log(`flattenDays: ${JSON.stringify(days)}`);
  const _days = clone(days);
  const flattenedDays = [];
  _days.forEach((_day, j) => {
    let flattenedTrainings = [];
    for (let i = 0, len = _day.trainings.length; i < len; i++) {
      flattenedTrainings.push({ instanceId: _day.trainings[i].uuid });
    }
    flattenedDays.push({ uuid: _day.uuid, trainings: flattenedTrainings });
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

// TODO move to trainingUtil
const isAugmented = (training) => {
  return (training.hasOwnProperty("uuid") && training.hasOwnProperty("name"));
}
