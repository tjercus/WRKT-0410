import moment from "moment";
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

/**
 * Make totals for the collective segments in a training
 * @param Array<Segment>
 * @return Object<Total>
 */
export function makeTrainingTotal(segments) {
  const totalObj = {
    distance: 0,
    duration: "00:00:00",
    pace: "00:00",
  };
  if (segments.length === 0) {
    return totalObj;
  }
  segments.forEach((segment) => {
    const _segment = augmentSegmentData(segment);
    totalObj.distance += parseFloat(_segment.distance);
    const totalDurationObj = moment.duration(totalObj.duration).add(_segment.duration);
    totalObj.duration = formatDuration(totalDurationObj);
  });
  if (hasNoRealValue(totalObj, "pace", totalObj.pace)) {
    totalObj.pace = makePace(totalObj);
  } else if (hasNoRealValue(totalObj, "duration")) {
    totalObj.duration = makeDuration(totalObj);
  }
  return totalObj;
}

/**
 * Calculate transient segment data based on present data
 * @param  {[type]} segment [description]
 * @return {[type]}         [description]
 */
export function augmentSegmentData(segment) {
  const _segment = clone(segment);
  _segment.pace = translateNamedPace(_segment.pace);
  if (canAugment(_segment)) {
    if (hasNoRealValue(_segment, "duration")) {
      _segment.duration = makeDuration(segment);
    }
    if (hasNoRealValue(_segment, "pace")) {
      _segment.pace = makePace(_segment);
    }
    if (hasNoRealValue(_segment, "distance")) {
      _segment.distance = makeDistance(_segment);
    }
  }
  if (isValidSegment(_segment)) {
    _segment.isValid = true;
  } else {
    _segment.isValid = false;
  }
  return _segment;
}

/**
 * Was a segment changed?
 * @param  {[type]}  segment  [description]
 * @param  {[type]}  segments [description]
 * @return {Boolean}          [description]
 */
export function isDirtySegment(segment, segments) {
  const _segment = clone(segment);
  const _segments = clone(segments);
  let storedSegment = null;
  for (let i = 0, len = _segments.length; i < len; i++) {
    if (_segments[i].uuid === _segment.uuid) {
      storedSegment = _segments[i];
      break;
    }
  }
  if (storedSegment === null) {
    return false;
  }
  const dirt = (storedSegment.distance !== _segment.distance
    || storedSegment.duration !== _segment.duration
    || storedSegment.pace !== _segment.pace);
  return dirt;
}

/**
 * Can a segment be augmented or is it complete or too incomplete?
 * @param  {[type]} segment [description]
 * @return {[type]}         [description]
 */
export function canAugment(segment) {
  const _segment = clone(segment);
  let augmentCount = 0;
  if (hasNoRealValue(_segment, "distance")) augmentCount++;
  if (hasNoRealValue(_segment, "duration")) augmentCount++;
  if (hasNoRealValue(_segment, "pace")) augmentCount++;
  return augmentCount === 1;
}

/**
 * Given a Segment with enough data, is the data valid?
 * @param  {[type]}  segment [description]
 * @return {Boolean}         [description]
 */
export function isValidSegment(segment) {
  const segmentClone = clone(segment);
  // if (makeDistance(segmentClone).toString()
  //    !== Number(segmentClone.distance).toFixed(3).toString()) {
  // 	return false;
  // }
  if (makeDuration(segmentClone) !== segmentClone.duration) {
    return false;
  }
  if (makePace(segmentClone) !== segmentClone.pace) {
    return false;
  }
  return true;
}

/**
 * parse a duration from:
 * a. int minutes to a duration as string 00:00:00
 * b. from 00:00 to 00:00:00
 */
export function parseDuration(duration) {
  if (duration !== null && duration !== "" && !isNaN(duration)) {
    return moment("2016-01-01").minutes(duration).format("HH:mm:ss");
  }
  if (duration !== null && duration !== "" && duration.length === 5) {
    return `00:${duration}`;
  }
  return duration;
}

/**
 * Remove a segment from a list
 * @param  {[type]} segment  [description]
 * @param  {[type]} segments [description]
 * @return {[type]}          [description]
 */
export function removeSegment(segment, segments) {
  const _segments = clone(segments);
  const isSeg = _segment => String(_segment.uuid) === String(segment.uuid);
  const index = _segments.findIndex(isSeg);
  _segments.splice((index > -1) ? index : _segments.length, 1);
  return _segments;
}

/**
 * Add a segment to a list
 * @param {[type]} segment       [description]
 * @param {[type]} segments      [description]
 * @param {[type]} overwriteUuid [description]
 */
export function addSegment(segment, segments, overwriteUuid) {
  const _segment = clone(segment);
  const _segments = clone(segments);
  if (!hasProperty(_segment, "uuid") || !_segment.uuid ||
    (overwriteUuid !== undefined && overwriteUuid === true)) {
    _segment.uuid = createUuid();
  }
  const augmentedSegment = augmentSegmentData(_segment);
  _segments.push(augmentedSegment);
  return _segments;
}

/**
 * @param moment.duration obj
 * @return hh:mm:ss String
 */
const formatDuration = duration =>
  `${lpad(duration.hours())}:${lpad(duration.minutes())}:${lpad(duration.seconds())}`;

/**
 * @return mm:ss String
 */
const makePace = (segment) => {
  const _segment = clone(segment);
  const durationObj = moment.duration(_segment.duration);
  const seconds = durationObj.asSeconds();
  const paceObj = moment.duration(Math.round(seconds / _segment.distance),
    "seconds");
  return `${lpad(paceObj.minutes())}:${lpad(paceObj.seconds())}`;
};

/**
 * Make duration based on distance and pace
 * @return hh:mm:ss String as: ex: 5:10 * 12.93 km = 1:6:48
 */
const makeDuration = (segment) => {
  const _segment = clone(segment);
  const paceObj = moment.duration(_segment.pace);
  const seconds = paceObj.asSeconds() / 60;
  const totalSeconds = Math.round(seconds * _segment.distance);
  const durationObj = moment.duration(totalSeconds, "seconds");
  const formattedDuration = formatDuration(durationObj);
  return formattedDuration;
};

/**
 * @return a real float. Calculated distance based on duration / pace
 */
const makeDistance = (segment) => {
  const _segment = clone(segment);
  const paceObj = moment.duration(_segment.pace);
  const durationObj = moment.duration(_segment.duration);
  const durationSeconds = durationObj.asSeconds();
  const paceSeconds = paceObj.asSeconds() / 60;
  if (paceSeconds === 0 || durationSeconds === 0) {
    return 0;
  }
  const rawDistance = durationSeconds / paceSeconds;
  return Math.round(rawDistance * 1000) / 1000;
};

// TODO extract to config
const translateNamedPace = (pace) => {
  if (pace === undefined || pace === null || !pace.startsWith("@")) {
    return pace;
  }
  switch (pace) {
    case "@RECOV":
      return "05:30";
    case "@EASY":
      return "05:10";
    case "@LRP":
      return "04:45";
    case "@MP":
      return "04:10";
    case "@MP+5%":
      return "04:22";
    case "@21KP":
      return "03:55";
    case "@16KP":
      return "03:50";
    case "@LT":
      return "03:50";
    case "@10KP":
      return "03:40";
    case "@5KP":
      return "03:33";
    case "@3KP":
      return "03:24";
    case "@MIP":
      return "03:10";
    default:
      return pace;
  }
};

