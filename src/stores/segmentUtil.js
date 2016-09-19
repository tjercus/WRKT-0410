import moment from "moment";
import {
  createUuid,
  clone,
  hasNoRealValue,
  lpad,
  hasProperty,
} from "./miscUtil";

/**
 * Remove a segment from a list
 * @param  {Segment}  segment object
 * @param  {Array<Segment>} segments
 * @param  {Array<Segment>} segments
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
 * @param  {Segment}  segment object
 * @param  {Array<Segment>} segments
 * @param {boolean} overwriteUuid?
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
 * update segment in a list
 * @param  {Segment}  segment object
 * @param  {[type]} segments [description]
 * @return {[type]}          [description]
 */
export function updateSegment(segment, segments) {
  const segmentClone = augmentSegmentData(segment);
  const _segments = clone(segments);
  /*
  let i = 0;
  segments.some((_segment) => {
    if (_segment.uuid === segmentClone.uuid) {
      this.segments[i] = segmentClone;
      this.total = makeTrainingTotal(this.segments);
      return true;
    }
    i++;
  });
  */

  const isSeg = _segment => String(_segment.uuid) === String(segmentClone.uuid);
  const index = _segments.findIndex(isSeg);
  _segments[index] = segmentClone;  
  return _segments;
}

/**
 * Make totals for the collective segments in a training
 * @param {Array<Segment>} segments
 * @return {Object<Total>} total
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
 * @param  {Segment} segment
 * @return {Segment} segment
 */
export function augmentSegmentData(segment) {
  const _segment = clone(segment);
  _segment.pace = translateNamedPace(_segment.pace);
  if (canAugment(_segment)) {
    if (hasNoRealValue(_segment, "duration")) {
      _segment.duration = makeDuration(_segment);
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
 * @param  {Segment}  segment object
 * @param  {Array<Segment>} segments
 * @return {Boolean} is the segment dirty compared to what collection holds?
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
 * @param  {Segment} segment is part of a training
 * @return {boolean} if augmentable
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
 * @param  {Segment}  segment [description]
 * @return {boolean}         [description]
 */
export function isValidSegment(segment) {
  const segmentClone = clone(segment);
  // if (makeDistance(segmentClone).toString()
  //    !== Number(segmentClone.distance).toFixed(3).toString()) {
  //  return false;
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
 * @param {string} duration as string HH:mm:ss
 * @return {Duration} as a moment.js obj
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
 * @param moment.duration obj
 * @return HH:mm:ss String
 */
const formatDuration = duration =>
  `${lpad(duration.hours())}:${lpad(duration.minutes())}:${lpad(duration.seconds())}`;

/**
 * @param {Segment} object
 * @return {string} pace as mm:ss
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
 * @param {Segment} object
 * Make duration based on distance and pace
 * @return {string} HH:mm:ss as: ex: 5:10 * 12.93 km = 1:6:48
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
 * @param {Segment} object
 * @return {float} distance. Calculated distance based on duration / pace
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
/**
 * Translate a pace with an @ to a real pace
 * @param  {string} pace is a description starting with an @
 * @return {string} realPace is conical pace as mm:ss
 */
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