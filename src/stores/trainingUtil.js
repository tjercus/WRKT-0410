import { createUuid, clone, lpad, hasNoRealValue, hasProperty } from "./miscUtil";

/**
 * Finds a training or an instance
 * @param  {string}
 * @param  {array<Training|TrainingInstance>}
 * @return {Training or TrainingInstance}
 */
export function findTraining(uuid, trainings) {
  if (uuid === null || uuid === undefined) {
    throw new Error(`findTraining: a valid uuid [${uuid}] should be provided`);
  }
  const _instances = clone(trainings);
  const isInstance = _instance => String(_instance.uuid) === String(uuid) ||
    String(_instance.instanceId) === String(uuid);
  const index = _instances.findIndex(isInstance);
  if (index < 0) {
    return null;
  }
  return _instances[index];
}

/**
 * Overwrite a Training in a list of Training elements
 * @param  {[type]} training  [description]
 * @param  {[type]} trainings [description]
 * @return {[type]}           [description]
 */
export function updateTraining(training, trainings) {
  const trainingClone = clone(training);
  const _trainings = clone(trainings);
  delete trainingClone.total;
  const isInstance = _training => String(_training.uuid) === String(
    trainingClone.uuid);
  const index = _trainings.findIndex(isInstance);
  if (index < 0) {
    throw new Error("updateTraining could not find training");
  }
  _trainings[index] = trainingClone;
  return _trainings;
}

/**
 * Remove a training from a list of TrainingInstances
 * @param  {[type]} uuid      [description]
 * @param  {[type]} instances [description]
 * @return {[type]}           [description]
 */
export function removeTrainingInstance(uuid, instances) {
  const _instances = clone(instances);
  // TODO extract as constant 'byUuid'
  const isInstance = _instance => String(_instance.uuid) === String(uuid);
  const index = _instances.findIndex(isInstance);
  _instances.splice((index > -1) ? index : _instances.length, 1);
  return _instances;
}

/**
 * Remove all traininginstances from the list that are associated to a give day
 * @param  {[type]} day               [description]
 * @param  {[type]} traininginstances [description]
 * @return {Array<TrainingInstance>}	list with traininginstances
 */
export function removeTrainingInstancesForDay(day, traininginstances) {
  if (day === null || !hasProperty(day, "uuid") || (!hasProperty(day,
      "training") && !hasProperty(day, "trainings"))) {
    throw new Error("a valid day should be provided");
  }
  let _traininginstances = clone(traininginstances);
  if (hasProperty(day, "trainings")) {
    day.trainings.forEach((_training) => {
      _traininginstances = removeTrainingInstance(_training.instanceId,
        _traininginstances);
    });
  } else {
    _traininginstances = removeTrainingInstance(day.training.instanceId, clone(
      traininginstances));
  }
  return _traininginstances;
}
