import test from "tape";
import {  
  makeTrainingTotal,
  augmentSegmentData,
  isDirtySegment,
  canAugment,
  isValidSegment,  
  parseDuration,
  removeSegment,
  addSegment,
  updateSegment,
} from "../src/stores/segmentUtil";

/**
 * Tests for {@link trainingUtil.js}
 */
const trainings = [{
    uuid: "blah-10",
    name: "name10"
},{
    uuid: "blah-11",
    name: "name11"
},{
    uuid: "blah-12",
    name: "name12"
}];

const days = [{
  uuid: "day-uuid-123",
  trainings: [
    { instanceId: "blah-10" },
    { instanceId: "blah-12" }
  ]
}];

const segments = [
  { "uuid": "99", "distance": 2.000, "duration": "00:11:00" },
  { "uuid": "100", "distance": 1.600, "pace": "@10KP" },
  { "uuid": "101", "distance": 0.600, "duration": "00:03:00" },
  { "uuid": "102", "distance": 1.600, "pace": "@10KP" },
  { "uuid": "103", "distance": 0.600, "duration": "00:03:00" },
  { "uuid": "104", "distance": 1.600, "pace": "@10KP" },
  { "uuid": "105", "distance": 0.600, "duration": "00:03:00" },
  { "uuid": "106", "distance": 1.600, "pace": "@10KP" },
  { "uuid": "107", "distance": 0.600, "duration": "00:03:00" },
  { "uuid": "108", "distance": 3.200, "pace": "@RECOV" }
];

test("makeTrainingTotal should return an object with zeros when there is no data", (assert) => {
  var total = makeTrainingTotal([]);
  assert.equal(total.distance, 0);
  assert.equal(total.duration, "00:00:00");
  assert.equal(total.pace, "00:00");
  assert.end();
});

test("makeTrainingTotal should calculate complete data on one segment without pace", (assert) => {
  let segment = {
    distance: 16,
    duration: "01:10:23"
  };
  var total = makeTrainingTotal([segment]);
  assert.equal(total.distance, 16.000);
  assert.equal(total.duration, "01:10:23");
  assert.equal(total.pace, "04:24");
  assert.end();
});

test("makeTrainingTotal should return an object with complete data on two segments", (assert) => {
  let segments = [{
    distance: 16,
    duration: "01:10:23"
  }, {
    distance: 16,
    duration: "00:59:02"
  }];
  var total = makeTrainingTotal(segments);
  assert.equal(total.distance, 32.000);
  assert.equal(total.duration, "02:09:25");
  assert.equal(total.pace, "04:03");
  assert.end();
});

test("makeTrainingTotal with three digit decimal precision distances should return an object with complete data with on two segments", (assert) => {
  let segments = [{
    distance: 1.08,
    duration: "00:07:43"
  }, {
    distance: 4.64,
    duration: "00:28:04"
  }];
  var total = makeTrainingTotal(segments);
  assert.equal(total.distance, 5.720);
  assert.equal(total.duration, "00:35:47");
  assert.equal(total.pace, "06:15");
  assert.end();
});

test("makeTrainingTotal should return an object with complete data on one segment with missing duration", (assert) => {
  let segments = [{
    distance: 12.930,
    pace: "05:10"
  }];
  var total = makeTrainingTotal(segments);
  console.log("CONCLUSIE: " + JSON.stringify(total));
  assert.equal(total.distance, 12.930);
  assert.equal(total.duration, "01:06:48");
  assert.equal(total.pace, "05:10");
  assert.end();
});

test("makeTrainingTotal should return an object with complete data on two segments with missing duration", (assert) => {
  let segments = [{
    distance: 12.930,
    pace: "04:10"
  }, {
    distance: 11.042,
    pace: "02:59"
  }];
  var total = makeTrainingTotal(segments);
  assert.equal(total.duration, "01:26:50");
  assert.end();
});

test("makeTrainingTotal with two segments with mixed missing data should return an object with complete data", (assert) => {
  let segments = [{
    distance: 12.930,
    pace: "04:10"
  }, {
    duration: "00:58:12",
    pace: "02:59"
  }];
  var total = makeTrainingTotal(segments);
  assert.equal(total.duration, "01:52:05");
  assert.end();
});

test("makeTrainingTotal with a zero'd segment should return an object with complete data", (assert) => {
  let segments = [{
    distance: 0,
    duration: "00:00:00",
    pace: "00:00"
  }, {
    distance: 5.0,
    duration: "00:25:00",
    pace: "05:00"
  }];
  var total = makeTrainingTotal(segments);
  assert.equal(total.distance, 5.000);
  assert.equal(total.duration, "00:25:00");
  assert.equal(total.pace, "05:00");
  assert.end();
});

test("augmentSegmentData should augment with distance", (assert) => {
  let segment = {    
    duration: "01:06:48",
    pace: "05:10"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(true, (typeof augmentedSegment.distance === "number"));
  assert.equal(augmentedSegment.distance, 12.929);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:10");
  assert.end();
});

test("augmentSegmentData should augment with duration", (assert) => {
  let segment = {
    distance: 12.929,
    pace: "05:10"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 12.929);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:10");
  assert.end();
});

test("augmentSegmentData should augment with a duration in only seconds", (assert) => {
  let segment = {
    duration: "00:00:40",
    pace: "06:00"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 0.111);
  assert.equal(augmentedSegment.duration, "00:00:40");
  assert.equal(augmentedSegment.pace, "06:00");
  assert.end();
});

test("augmentSegmentData should augment with pace", (assert) => {
  let segment = {
    distance: 12.929,
    duration: "01:06:48"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 12.929);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:10");
  assert.end();
});

test("augmentSegmentData should augment with distance", (assert) => {
  let segment = {    
    duration: "01:06:48",
    pace: "05:10"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 12.929);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:10");
  assert.end();
});

test("augmentSegmentData should work with named paces", (assert) => {
  let segment = {    
    duration: "01:06:48",
    pace: "@RECOV"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 12.145);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:30");
  assert.end();
});

test("augmentSegmentData should work with named paces 2", (assert) => {
  let segment = {
    distance: 10,
    pace: "@5KP",
  };
  var augmentedSegment = augmentSegmentData(segment);
  assert.equal(augmentedSegment.distance, 10);
  assert.equal(augmentedSegment.duration, "00:35:30");
  assert.equal(augmentedSegment.pace, "03:33");
  assert.end();
});

test("augmentSegmentData should augment with a duration in only zeros", (assert) => {
  let segment = {
    distance: 5,
    duration: "00:00:00",
    pace: "04:30"
  };
  var augmentedSegment = augmentSegmentData(segment);
  assert.equal(augmentedSegment.distance, 5);
  assert.equal(augmentedSegment.duration, "00:22:30");
  assert.equal(augmentedSegment.pace, "04:30");
  assert.end();
});

test("isDirtySegment should detect a dirty segment", (assert) => {
  let segments = [{
    uuid: "segment1",
    distance: 12.929,
    duration: "01:07:48",
    pace: "05:10"
  }];

  let segment = {
    uuid: "segment1",
    distance: 12.929,
    duration: "01:06:48",
    pace: "05:10"
  };

  var isDirty = isDirtySegment(segment, segments);  
  assert.ok(isDirty);  
  assert.end();
});

test("isDirtySegment should NOT detect a dirty segment", (assert) => {
  let segments = [{
    uuid: "segment1",
    distance: 12.929,
    duration: "01:06:48",
    pace: "05:10"
  }];

  let segment = {
    uuid: "segment1",
    distance: 12.929,
    duration: "01:06:48",
    pace: "05:10"
  };

  var isDirty = isDirtySegment(segment, segments);  
  assert.notOk(isDirty);
  assert.end();
});

test("canAugment should return true when 2 out of 3 items are present", (assert) => {
  let segment = {
    duration: "01:06:48",
    pace: "05:10"
  }; 

  let itCan = canAugment(segment);  
  assert.ok(itCan);  
  assert.end();
});

test("canAugment should return false when 3 out of 3 items are present", (assert) => {
  let segment = {
    distance: 12.929,
    duration: "01:06:48",
    pace: "05:10"
  }; 

  let itCan = canAugment(segment);  
  assert.notOk(itCan);
  assert.end();
});

test("canAugment should return false when 2 out of 3 items are zero'd but has pace", (assert) => {
  let segment = {
    distance: 0,
    duration: "00:00:00",
    pace: "05:10"
  }; 

  let itCan = canAugment(segment);  
  assert.notOk(itCan);
  assert.end();
});

test("canAugment should return false when 2 out of 3 items are zero'd but has distance", (assert) => {
  let segment = {
    distance: 12,
    duration: "00:00:00",
    pace: "00:00"
  }; 

  let itCan = canAugment(segment);  
  assert.notOk(itCan);
  assert.end();
});

test("canAugment should return false when 2 out of 3 items are zero'd but has duration", (assert) => {
  let segment = {
    distance: 0,
    duration: "00:24:53",
    pace: "00:00"
  }; 

  let itCan = canAugment(segment);  
  assert.notOk(itCan);
  assert.end();
});


test("canAugment should return true when duration is zero'd", (assert) => {
  let segment = {
    distance: 12,
    duration: "00:00:00",
    pace: "05:10"
  }; 

  let itCan = canAugment(segment);  
  assert.ok(itCan);  
  assert.end();
});

test("canAugment should return true when distance is zero'd", (assert) => {
  let segment = {
    distance: 0,
    duration: "00:12:11",
    pace: "05:10"
  }; 

  let itCan = canAugment(segment);  
  assert.ok(itCan);  
  assert.end();
});

test("canAugment should return true when pace is zero'd", (assert) => {
  let segment = {
    distance: 12,
    duration: "00:12:11",
    pace: "00:00"
  }; 

  let itCan = canAugment(segment);  
  assert.ok(itCan);  
  assert.end();
});

test("isValidSegment should detect a valid segment", (assert) => {
  let segment = {
    distance: 12.929,
    duration: "01:06:48",
    pace: "05:10"
  }; 

  let isValid = isValidSegment(segment);  
  assert.ok(isValid);
  assert.end();
});

test("isValidSegment should detect a NOT valid segment", (assert) => {
  let segment = {
    distance: 5,
    duration: "01:012:12",
    pace: "03:49"
  }; 

  let isValid = isValidSegment(segment);  
  assert.notOk(isValid);
  assert.end();
});

test("parseDuration should NOT parse duration when input is not parsable from int", (assert) => {  
  assert.equal(parseDuration(null), null, "should return null on null");
  assert.equal(parseDuration(""), "", "should return empty string on empty string");
  assert.equal(parseDuration(0), "00:00:00", "should 00:00:00 on zero int");
  assert.end();
});

test("parseDuration should parse duration as int minutes to duration as string", (assert) => {
  const data = [    
    {input: 60, output: "01:00:00"},
    {input: 59, output: "00:59:00"},
    {input: 65, output: "01:05:00"},
    {input:121, output: "02:01:00"}
  ];
  for (let i = 0, len = data.length; i < len; i++) {
    assert.equal(parseDuration(data[i].input), data[i].output);
  }
  assert.end();
});

test("parseDuration should pad duration when hours are omitted", (assert) => {
  assert.equal(parseDuration("15:01"), "00:15:01", "should parse with omitted hours");
  assert.end();
});

test("removeSegment should find and remove a segment", (assert) => {
  const segment = {
    uuid: "101"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = removeSegment(segment, segments);
  assert.equal(segments.length, 10, "removing should not alter the original list");
  assert.equal(newSegments.length, 9, "after removing one there should be 9 segments");
  assert.end();
});

test("removeSegment should not remove an unfound segment", (assert) => {
  const segment = {
    uuid: "99999"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = removeSegment(segment, segments);
  assert.equal(segments.length, 10, "removing should not alter the original list");
  assert.equal(newSegments.length, 10, "after there should be 10 segments");
  assert.end();
});

test("addSegment should add a segment", (assert) => {
  const segment = {
    uuid: "99999",
    pace: "55:55"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = addSegment(segment, segments);
  assert.equal(segments.length, 10, "adding should not alter the original list");
  assert.equal(newSegments.length, 11, "after adding there should be 11 segments");
  const index = newSegments.findIndex((_segment) => {
    return _segment.uuid === "99999";
  });
  assert.ok((index !== -1), "original uuid should be found = " + index);
  assert.end();
});

test("addSegment should add a segment with a new UUID if asked to do so", (assert) => {
  const segment = {
    uuid: "99999",
    pace: "66:66"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = addSegment(segment, segments, true);
  assert.equal(newSegments.length, 11, "after adding there should be 11 segments");
  const index = newSegments.findIndex((_segment) => {
    return _segment.uuid === "99999";
  });
  console.log(JSON.stringify(newSegments));
  assert.ok((index === -1), "original uuid should not be found = " + index);
  // check if all segments have a uuid property
  const segmentWithoutUuid = newSegments.find((_segment) => {
    return !_segment.hasOwnProperty("uuid");
  });
  assert.equal(segmentWithoutUuid, undefined);
  assert.end();
});

test("addSegment should add a segment twice", (assert) => {
  const segment = {
    uuid: "88888",
    pace: "44:44"
  };
  const segment2 = {
    uuid: "99999",
    pace: "55:55"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = addSegment(segment2, addSegment(segment, segments));  
  assert.equal(segments.length, 10, "adding should not alter the original list");
  assert.equal(newSegments.length, 12, "after adding there should be 11 segments");  
  assert.end();
});

test("updateSegment should update a segment", (assert) => {
  let segment = {
    uuid: "101",
    distance: 5,
    duration: "01:012:12",
    isValid: false,
    pace: "03:49"
  };
  assert.equal(segments.length, 10, "initially there should be 10 segments");
  const newSegments = updateSegment(segment, segments);  
  assert.equal(segments.length, 10, "updating should not increase the original list");
  assert.equal(newSegments.length, 10, "updating should not increase the returned list");
  assert.equal(newSegments[2].toString(), segment.toString(), "segment should be overwritten");
  assert.end();
});
