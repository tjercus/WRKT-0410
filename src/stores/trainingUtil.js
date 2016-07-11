import moment from "moment";
import {createUuid, clone, lpad, hasNoRealValue} from "./miscUtil";

/**
 * Finds a training or an instance
 * @param  {string}
 * @param  {array<Training|TrainingInstance>}
 * @return {Training or TrainingInstance}
 */
export function findTraining(uuid, trainings) {	
	let needle = null;
	for (let i = 0, len = trainings.length; i < len; i++) {
		//console.log(`training: [${trainings[i].uuid}] versus needle [${uuid}]`);
		if (trainings[i].uuid == uuid || trainings[i].instanceId == uuid ) {
			needle = trainings[i];
			break;
		}
	}
	return needle;
}

export function updateTraining(training, trainings) {
	//console.log("trainingUtil.updateTraining: type: " + training.type);
	const _trainings = clone(trainings);
  let i = 0;
  _trainings.some((_training) => {
	  if (_training.uuid === training.uuid) {
	    _trainings[i] = training;
	    return true;
	  }
	  i++;
  });
  return _trainings;
}

/**
 * @param array
 * @return Object
 */
export function makeTrainingTotal(segments) {
	let totalObj = {
		distance: 0,
		duration: "00:00:00",
		pace: "00:00"
	};
	if (segments.length === 0) {
		return totalObj;
	} else {		
		segments.forEach((segment) => {
			segment = augmentSegmentData(segment);
			totalObj.distance += parseFloat(segment.distance);
			let totalDurationObj = moment.duration(totalObj.duration).add(segment.duration);			
			totalObj.duration = formatDuration(totalDurationObj);			
		});
		if (hasNoRealValue(totalObj, "pace", totalObj.pace)) {
			totalObj.pace = makePace(totalObj);			
		} else if (hasNoRealValue(totalObj, "duration")) {
			totalObj.duration = makeDuration(totalObj);			
		}
	}
	//console.log("trainingUtil.makeTrainingTotal: " + JSON.stringify(totalObj));
	return totalObj;
}

export function augmentSegmentData(segment) {
	segment = clone(segment);
	segment.pace = translateNamedPace(segment.pace);	
	if (canAugment(segment)) {
		if (hasNoRealValue(segment, "duration")) {
			segment.duration = makeDuration(segment);
		}
		if (hasNoRealValue(segment, "pace")) {
			segment.pace = makePace(segment);
		}
		if (hasNoRealValue(segment, "distance")) {
			segment.distance = makeDistance(segment);
		}		
	}
	if (isValidSegment(segment)) {
		segment.isValid = true;
	} else {
		segment.isValid = false;
	}	
	return segment;
}

export function isDirtySegment(segment, segments) {
	segment = clone(segment);
	segments = clone(segments);
	let storedSegment = null;
	for (let i = 0, len = segments.length; i < len; i++) {		
		if (segments[i].uuid === segment.uuid) {			
			storedSegment = segments[i];
			break;
		}
	}
	if (storedSegment === null) {
		return false;
	}
	let isDirtySegment = (storedSegment.distance !== segment.distance || storedSegment.duration !== segment.duration || storedSegment.pace !== segment.pace);	
	return isDirtySegment;
}

export function canAugment(segment) {	
	segment = clone(segment);
	const can = (segment && (!segment.hasOwnProperty("distance") || segment.distance === "" || !segment.hasOwnProperty("duration") || segment.duration === "" || !segment.hasOwnProperty("pace") || segment.pace === ""));	
	return can;
}

export function isValidSegment(segment) {
	let segmentClone = clone(segment);
	// if (makeDistance(segmentClone).toString() !== Number(segmentClone.distance).toFixed(3).toString()) {
	// 	// console.log("isValidSegment: false: " + Number(segmentClone.distance).toFixed(3) + "/" + makeDistance(segmentClone));
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
* parse a duration from int minutes to a duration as string 00:00:00
*/
export function parseDuration(duration) {
	if (duration !== null && duration !== "" && !isNaN(duration)) {
		let parsed = moment("2016-01-01").minutes(duration).format("HH:mm:ss");
		return parsed;
	}
	return duration;	
}

export function removeSegment(segment, segments) {
  let _segments = clone(segments);
  const isSeg = (_segment) => {
  	return _segment.uuid == segment.uuid;
  }
  const index = _segments.findIndex(isSeg);
  _segments.splice((index > -1) ? index : _segments.length, 1);
  return _segments;  
}

export function addSegment(segment, segments, overwriteUuid) {
	console.log(`addSegment init (${segments.length}) ${JSON.stringify(segments)}`);
	const _segment = clone(segment);
	const _segments = clone(segments);
	console.log("addSegment created copy of segment " + JSON.stringify(_segment));
	if (!_segment.hasOwnProperty("uuid") || !_segment.uuid ||
	  (overwriteUuid !== undefined && overwriteUuid === true)) {
		console.log("addSegment overwriting uuid");
    _segment.uuid = createUuid();
  }
  console.log(`addSegment ${_segment.uuid}`);
  const augmentedSegment = augmentSegmentData(_segment);
  _segments.push(augmentedSegment);
  console.log(`addSegment final (${_segments.length}) ${JSON.stringify(_segments)}`);
  return _segments;
}

/* ----------------------------------------------------------------------------------- */

/**    
 * @param moment.duration obj
 * @return hh:mm:ss String
 */
function formatDuration(duration) {	
	return `${lpad(duration.hours())}:${lpad(duration.minutes())}:${lpad(duration.seconds())}`;
}

/**
 * @return mm:ss String
 */
function makePace(segment) {
	segment = clone(segment);
	let durationObj = moment.duration(segment.duration),
		seconds = durationObj.asSeconds(),
		paceObj = moment.duration(Math.round(seconds / segment.distance), "seconds");
	return `${lpad(paceObj.minutes())}:${lpad(paceObj.seconds())}`;
};

/**    
 * @return hh:mm:ss String as: pace * distance. ex: 5:10 * 12.93 km = 1:6:48
 */
function makeDuration(segment) {
	segment = clone(segment);
	let paceObj = moment.duration(segment.pace),
		seconds = paceObj.asSeconds() / 60,
		totalSeconds = Math.round(seconds * segment.distance),
		durationObj = moment.duration(totalSeconds, "seconds");
	let formattedDuration = formatDuration(durationObj);	
	return formattedDuration;
};

/**
 * @return a real float. Calculated distance based on duration / pace
 */
function makeDistance(segment) {
	segment = clone(segment);
	let paceObj = moment.duration(segment.pace),
		durationObj = moment.duration(segment.duration),
		durationSeconds = durationObj.asSeconds(),
		paceSeconds = paceObj.asSeconds() / 60;	
	if (paceSeconds === 0 || durationSeconds === 0) {
		return 0;
	}
	let rawDistance = durationSeconds / paceSeconds;
	return Math.round(rawDistance * 1000) / 1000;	
};

// TODO extract to config
function translateNamedPace(pace) {
	if (pace === undefined || pace === null || !pace.startsWith("@")) {
		return pace;
	}
	switch (pace) {
		case "@RECOV": return "05:30"; break;
		case "@LRP": return "04:45"; break;
		case "@MP": return "04:10"; break;
		case "@MP+5%": return "04:22"; break;
		case "@21KP": return "03:55"; break;
		case "@16KP": return "03:50"; break;
		case "@LT": return "03:50"; break;
		case "@10KP": return "03:40"; break;
		case "@5KP": return "03:33"; break;
		case "@3KP": return "03:24"; break;
		case "@MIP": return "03:10"; break;
		default: return pace; break;
	};
}