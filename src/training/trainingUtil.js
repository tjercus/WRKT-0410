
import {clone, createUuid, hasProperty, removeProperty} from "../shell/objectUtil";
import { augmentSegmentData, makeTrainingTotal } from "./segmentUtil";

export function NotFoundException(msg) {
  function toString() {
    return `NotFoundException: ${msg}`;
  }
}

/**
 * Finds a training or an instance
 * @param  {string} uuid - id
 * @param  {Array<Training|TrainingInstance>} trainings - the collection to search
 * @return {Training|TrainingInstance} findable
 */
export function findTraining(uuid, trainings) {
  if (uuid === null || uuid === undefined) {
    throw new Error(`findTraining: a valid uuid [${uuid}] should be provided`);
  }
  const _instances = clone(trainings);
  const isInstance = _instance =>
    String(_instance.uuid) === String(uuid) || String(_instance.instanceId) === String(uuid);
  const index = _instances.findIndex(isInstance);
  if (index < 0) {
    return null;
  }

  return augmentTraining(_instances[index]);
}

/**
 * Overwrite a Training in a list of Training elements
 * @param  {Training} training - to overwrite entry in list
 * @param  {Array<Training>} trainings - the collection to search
 * @return  {Array<Training>} trainings - the updated collection
 */
export function updateTraining(training, trainings) {
  const trainingClone = clone(training);
  const _trainings = clone(trainings);
  delete trainingClone.total;
  const isInstance = _training => String(_training.uuid) === String(trainingClone.uuid);
  const index = _trainings.findIndex(isInstance);
  if (index < 0) {
    throw new NotFoundException("updateTraining could not find training");
  }
  _trainings[index] = trainingClone;
  return _trainings;
}

/**
 * Remove a training from a list of TrainingInstances
 * @param  {string} uuid - id
 * @param  {Array<TrainingInstance>} instances - the collection to search
 * @return  {Array<TrainingInstance>} instances - the updated collection
 */
export function removeTrainingInstance(uuid, instances) {
  const _instances = clone(instances);
  // TODO extract as constant 'byUuid'
  const isInstance = _instance => String(_instance.uuid) === String(uuid);
  const index = _instances.findIndex(isInstance);
  _instances.splice(index > -1 ? index : _instances.length, 1);
  return _instances;
}

/**
 * Remove all traininginstances from the list that are associated to a give day
 * @param  {Day} day - Day
 * @param  {Array<TrainingInstance>} traininginstances - list to search
 * @return {Array<TrainingInstance>} list with traininginstances
 */
export function removeTrainingInstancesForDay(day, traininginstances) {
  if (
    day === null ||
      !hasProperty(day, "uuid") ||
      !hasProperty(day, "training") && !hasProperty(day, "trainings")
  ) {
    throw new Error("a valid day should be provided");
  }
  let _traininginstances = clone(traininginstances);
  if (hasProperty(day, "trainings")) {
    day.trainings.forEach(_training => {
      _traininginstances = removeTrainingInstance(_training.instanceId, _traininginstances);
    });
  } else {
    _traininginstances = removeTrainingInstance(day.training.instanceId, clone(traininginstances));
  }
  return _traininginstances;
}

/**
 * @param {Day} day - to be changed
 * @param {TrainingInstance} instance - trainingInstance
 * @returns {Day} day - modified
 */
export function addTrainingInstanceToDay(day, instance) {
  const _instance = clone(instance);
  // _instance.uuid = createUuid();
  const _trainings = clone(day.trainings);
  _trainings.push(_instance);
  day.trainings = _trainings;
  return day;
}

/**
 *
 * @param {Day} day - holds 1 or 2 trainings
 * @param {TrainingInstance} instance - copy of a Training
 * @returns {Day} is the modified day
 */
export function updateTrainingInstanceInDay(day, instance) {
  const _day = clone(day);
  const isInstance = _instance => String(_instance.uuid) === String(instance.uuid);
  const index = _day.trainings.findIndex(isInstance);
  if (index < 0) {
    throw new NotFoundException("updateTrainingInstanceInDay could not find training in this day");
  }
  _day.trainings[index] = instance;
  return _day;
}

/**
 *
 * @param {Training|TrainingInstance} training - with possibly un-augmented segments
 * @returns {Training|TrainingInstance} _training - with augmented segments
 */
export function augmentTraining(training) {  
  if (typeof training === "undefined" || training === null) {
    console.error("augmentTraining received an undefined training");
  }
  if (typeof training.segments === "undefined" || training.segments === null) {
    console.warn("augmentTraining received a training without segments");
    return training;
  }
  console.log(`augmentTraining 1 [${training.uuid}] segments: ${JSON.stringify(training.segments)}`);

  const _segments = training.segments.map(segment =>
    linkSegmentToTraining(training, augmentSegmentData(segment)));
  training.segments = _segments;
  console.log(`augmentTraining 2 [${training.uuid}] segments: ${JSON.stringify(_segments)}`);
  training.total = makeTrainingTotal(_segments);
  return training;
}

/**
 * Annotate segment with trainingUuid property
 * @param {TrainingInstance} training - the training
 * @param {Segment} segment - the segment under fire
 */
const linkSegmentToTraining = (training, segment) => {
  const _segment = clone(segment);
  _segment.trainingUuid = training.uuid;
  // console.log(`linkSegmentToTraining ${JSON.stringify(_segment)}`);
  return _segment;
};

/**
 * Strips a training of stuff it does not need for persisting
 * @param {TrainingInstance} instance - full, verbose, annotated
 * @returns {TrainingInstance} instance - stripped, clean, save-able
 */
export function cleanTraining(instance) {
  let _segments = instance.segments.map(_segment => {
    return removeProperty(removeProperty(removeProperty(_segment, "trainingUuid"), "isValid"), "obsolete");
  });
  instance.segments = _segments;
  return instance;
}