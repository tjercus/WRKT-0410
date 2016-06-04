import moment from "moment";
import {createUuid, clone, lpad, hasNoRealValue} from "./miscUtil";

export function findTraining(uuid, trainings) {	
	let needle = null;
	for (let i = 0, len = trainings.length; i < len; i++) {
		//console.log("findTraining looking at training: " + trainings[i].uuid + "/" + trainings[i].name);
		if (trainings[i].uuid === uuid) {
			console.log("findTraining found training: " + trainings[i].name);
			needle = trainings[i];
			break;
		} else {
			//console.log("findTraining NOT equal " + trainings[i].uuid + " and " + JSON.stringify(uuid));
		}
	}
	return needle;
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
		console.log("makeTrainingTotal 2: size " + segments.length);
		segments.forEach((segment) => {
			segment = augmentSegmentData(segment);
			totalObj.distance += parseFloat(segment.distance);
			let totalDurationObj = moment.duration(totalObj.duration).add(segment.duration);
			console.log("makeTrainingTotal segment: " + JSON.stringify(segment));
			totalObj.duration = formatDuration(totalDurationObj);
			//console.log("LOOP: dist " + totalObj.distance + ", dur " + totalObj.duration);
		});
		if (hasNoRealValue(totalObj, "pace", totalObj.pace)) {
			totalObj.pace = makePace(totalObj);
			console.log("makeTrainingTotal 2.5: making pace based on duration, pace: " + totalObj.pace + ", dur: " + totalObj.duration);
		} else if (hasNoRealValue(totalObj, "duration", totalObj.duration)) {
			totalObj.duration = makeDuration(totalObj);
			console.log("makeTrainingTotal 3: making duration based on pace: " + totalObj.pace + ", dur: " + totalObj.duration);
		}
	}
	return totalObj;
}

export function augmentSegmentData(segment) {
	segment = clone(segment);
	segment.pace = translateNamedPace(segment.pace);
	console.log("augmentSegmentData augment from " + JSON.stringify(segment));
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
		console.log("augmentSegmentData augment pace to " + segment.pace);
	}
	if (isValidSegment(segment)) {
		segment.isValid = true;
	} else {
		segment.isValid = false;
	}
	console.log("augmentSegmentData augment TO " + JSON.stringify(segment));
	return segment;
}

export function isDirtySegment(segment, segments) {
	segment = clone(segment);
	segments = clone(segments);
	let storedSegment = null;
	for (let i = 0, len = segments.length; i < len; i++) {
		console.log("trainingUtils.isDirtySegment looking at segment: " + segments[i].uuid);
		if (segments[i].uuid === segment.uuid) {
			console.log("trainingUtils.isDirtySegment found segment: " + segments[i].uuid);
			storedSegment = segments[i];
			break;
		}
	}
	if (storedSegment === null) {
		return false;
	}
	let isDirtySegment = (storedSegment.distance !== segment.distance || storedSegment.duration !== segment.duration || storedSegment.pace !== segment.pace);
	console.log("trainingUtils.isDirtySegment: " + JSON.stringify(segment) + " versus " + JSON.stringify(storedSegment) + ", dirty? " + isDirtySegment);
	return isDirtySegment;
}

export function canAugment(segment) {	
	segment = clone(segment);
	const can = (segment && (!segment.hasOwnProperty("distance") || segment.distance === "" || !segment.hasOwnProperty("duration") || segment.duration === "" || !segment.hasOwnProperty("pace") || segment.pace === ""));
	console.log("canAugment: uuid: " + segment.uuid + ", can? " + can);
	return can;
}

export function isValidSegment(segment) {
	let segmentClone = clone(segment);
	// if (makeDistance(segmentClone).toString() !== Number(segmentClone.distance).toFixed(3).toString()) {
	// 	console.log("isValidSegment: false: " + Number(segmentClone.distance).toFixed(3) + "/" + makeDistance(segmentClone));
	// 	return false;
	// }	
	if (makeDuration(segmentClone) !== segmentClone.duration) {
		console.log("isValidSegment: false: " + segmentClone.duration);
		return false;
	}
	if (makePace(segmentClone) !== segmentClone.pace) {
		console.log("isValidSegment: false: " + segmentClone.pace);
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
		console.log("parseDuration: " + duration + ", to " + parsed);
		return parsed;
	}
	return duration;	
}

/* ----------------------------------------------------------------------------------- */

/**    
 * @param moment.duration obj
 * @return hh:mm:ss String
 */
function formatDuration(duration) {	
	return lpad(duration.hours()) + ":" + lpad(duration.minutes()) + ":" + lpad(duration.seconds());
}

/**
 * @return mm:ss String
 */
function makePace(segment) {
	segment = clone(segment);
	let durationObj = moment.duration(segment.duration),
		seconds = durationObj.asSeconds(),
		paceObj = moment.duration(Math.round(seconds / segment.distance), "seconds");
	return lpad(paceObj.minutes()) + ":" + lpad(paceObj.seconds());
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
	console.log("formattedDuration: " + formattedDuration + ", " + paceObj.asSeconds());
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
	console.log("makeDistance: seconds? " + durationSeconds + ", paceSeconds? " + paceSeconds);
	// TODO debug rounding with decimals
	if (paceSeconds === 0 || durationSeconds === 0) {
		return 0;
	}
	let rawDistance = durationSeconds / paceSeconds;
	let distance = Math.round(rawDistance * 1000) / 1000;
	let isNumeric = (typeof distance == 'number');
	let isString = (typeof distance == 'string');
	console.log("makeDistance: " + distance + ", nr? " + isNumeric + ", string? " + isString);
	return distance;
};

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
		case "@10KP": return "03:40"; break;
		case "@5KP": return "03:33"; break;
		case "@3KP": return "03:24"; break;
		case "@MIP": return "03:10"; break;
		default: return pace; break;
	};
}