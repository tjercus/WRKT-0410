
import pureSwap from "pure-swap";
import {
  findTraining,
} from "./trainingUtil";
import {
  makeTrainingTotal,
} from "./segmentUtil";
import {
  clone,
  createUuid,
  hasProperty,
} from "./miscUtil";

/**
 * @typedef {Object} Plan
 * @property {string} uuid
 * @property {string} name
 * @property {Array<Day>} days
 * @property {string} startDate
 */

/**
 * @typedef {Object} Day
 * @property {string} uuid
 * @property {Array<Training>} trainings
 */

/**
 * Find a day in a list of days for a plan, augment the trainings in the day
 * @param  {string} dayUuid - identifier
 * @param  {Plan} plan - contains days
 * @param  {Array<Training>} trainings | [] - used for augmenting trainings if needed
 * @return {Day} day - augmented day
 */
export function findDay(dayUuid, plan, trainings = []) {
  if (!plan.days || plan.days.length === 0) {
    throw new Error("findDay plan should have a list of days!");
  }
  const _days = clone(plan.days);
  const byUuid = (_day) => String(_day.uuid) === String(dayUuid);
  const index = _days.findIndex(byUuid);
  if (index < 0) {
    throw new Error(`findDay could not find day with ${dayUuid}`);
  } else {
    console.log(`timelineUtil.findDay index ${index}`);
  }
  //if (isAugmentedDay(_days[index])) {

  if (trainings && trainings.length > 0) {
    console.log(`The day you requested (${JSON.stringify(_days[index])}) will be augmented using ${trainings.length} traininginstances`);
    return augmentDay(_days[index], clone(trainings));
  } else {
    return _days[index];
  }
}

/**
 * lookup training for a day by uuid and add it to itself
 * @param { Object } day - flattened day object with ref to inflated day
 * @param { Array<TrainingInstance> } trainings - list of augmented TrainingInstance objects
 * @return { Day } - augmented day
 */
export function augmentDay(day, trainings) {
  if (trainings.length === 0) {
    throw new Error("traininginstances should be provided!");
  }
  const _day = clone(day);
  const _trainings = clone(trainings);
  const uuid = (typeof _day.instanceId === "string") ? _day.instanceId : null;

  if (!hasProperty(_day, "trainings")) {
    _day.trainings = [];
    _day.trainings.push({ instanceId: uuid });
  }
  // calculate total per training when multiple trainings
  for (let i = 0, len = _day.trainings.length; i < len; i++) {
    if (hasProperty(_day.trainings[i], "instanceId")) {
      _day.trainings[i] = findTraining(_day.trainings[i].instanceId, _trainings);
    }
    _day.trainings[i].total = makeTrainingTotal(_day.trainings[i].segments);
  }
  //console.log(`timelineUtils.augmentDay ${JSON.stringify(_day)}`);
  return _day;
}

/**
 * Takes an array of augmented days and flattens it so there are only
 *  references to instances instead of full traininginstance.
 * @param  {Array<Day>} days - augmented as used in application
 * @return {Array<Day>} days - flattened for storage
 */
export function flattenDays(days) {
  const _days = clone(days);
  const flattenedDays = [];
  _days.forEach((_day) => {
    const flattenedTrainings = [];
    for (let i = 0, len = _day.trainings.length; i < len; i++) {
      flattenedTrainings.push({ instanceId: _day.trainings[i].uuid });
    }
    flattenedDays.push({ uuid: _day.uuid, trainings: flattenedTrainings });
  });
  return flattenedDays;
}

/**
 * Give a uuid for a day, remove it"s trainings
 * @param  {string} dayUuid - unique identifier for a day
 * @param  {Array<Day>} days - original list of days
 * @return {Array<Day>} days - without trainings for dayUuid
 */
export function removeTrainingsFromDay(dayUuid, days) {
  const _days = clone(days);
  const byUuid = (_day) => String(_day.uuid) === String(dayUuid);
  const index = _days.findIndex(byUuid);
  if (index > -1) {
    if (hasProperty(_days[index], "trainings")) {
      const newTrainings = [];
      // TODO for now hardcoded to 2 trainings per day
      newTrainings.push(nullTraining);
      newTrainings.push(nullTraining);
      _days[index].trainings = newTrainings;
    } else {
      _days[index].training = nullTraining;
    }
  }
  return _days;
}

/**
 * Move a day in a list of days by x positions
 * @param  {String} dayUuid - unique id for a day
 * @param  {Array<Day>} days - list to modify
 * @param  {int} positions, where a positive means
 *  move later in time and a negative means move to an earlier spot
 * @return {Array<Day>} days, list of resorted days
 */
export function moveDay(dayUuid, days, positions) {
  const _days = clone(days);
  const byUuid = (_day) => String(_day.uuid) === String(dayUuid);
  const index = _days.findIndex(byUuid);
  console.log(`timelineUtil moveDay ${dayUuid} index: ${index}, length: ${days.length}`);
  if (index > -1) {
    const temp = pureSwap(_days, index, index + positions);
    console.log(`timelineUtil moveDay result ${JSON.stringify(temp)}, length: ${days.length}`);
    return temp;
  }
  throw new Error("Could not move day");
}

/**
 * Make a clone for a day
 * @param  {Day} oldDay - cloneable
 * @return {Day} newDay - clone
 */
export function cloneDay(oldDay) {
  const newDay = clone(oldDay);
  newDay.uuid = createUuid();
  if (hasProperty(oldDay, "trainings")) {
    const clonedTrainings = [];
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
  return newDay;
}

/**
 * Delete a day in a list of days by uuid
 * @param  {String} dayUuid - unique id for a day
 * @param  {Array<Day>} days - list to modify
 * @return  {Array<Day>} days - modified list
 */
export function deleteDay(dayUuid, days) {
  const _days = clone(days);
  const byUuid = (_day) => String(_day.uuid) === String(dayUuid);
  const index = _days.findIndex(byUuid);
  if (index > -1) {
    _days.splice(index, 1);
  }
  return _days;
}

/**
 * Factory object for an empty Training
 * @return {Training} with default/empty values
 */
const nullTraining = {
  uuid: createUuid(),
  name: "No Run",
  distance: 0,
  duration: "00:00:00",
  pace: "00:00",
  type: "",
  total: { distance: 0, duration: "00:00:00", pace: "00:00" },
};

// TODO fix broken function
const isAugmentedDay = (day) =>
  (hasProperty(day, "trainings") && hasProperty(day.trainings[0], "name"));
 // TODO move to trainingUtil
// TODO fix broken function, should look at segments, to see if it has all three (pace, duration, time)
const isAugmentedTraining = (training) =>
  (hasProperty(training, "uuid") && hasProperty(training, "name"));
