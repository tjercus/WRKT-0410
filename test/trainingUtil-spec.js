import test from "tape";
import {
  findTraining,
  makeTrainingTotal,
  augmentSegmentData,
  isDirtySegment,
  canAugment,
  isValidSegment,
  createUuid
} from "../src/stores/trainingUtil";

/**
 * Tests for {@link trainingUtil.js}
 */
let trainings = [{
    uuid: "blah-10",
    name: "name10"
},{
    uuid: "blah-11",
    name: "name11"
},{
    uuid: "blah-12",
    name: "name12"
}];

test("findTraining should find a training by uuid", (assert) => {  
  let training = findTraining("blah-11", trainings);  
  assert.equal(true, (typeof training === "object"));
  assert.equal(training.uuid, "blah-11");
  assert.equal(training.name, "name11");
  assert.end();
});

test("findTraining should return null when not found", (assert) => {  
  let training = findTraining("125-456", trainings);  
  assert.equal(null, training);
  assert.end();
});

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

test("makeTrainingTotal with an empty segment should return an object with complete data", (assert) => {
  let segments = [{
    distance: "",
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

test("augmentSegmentData should work with duration as int minutes", (assert) => {
  let segment = {
    duration: 65,
    pace: "05:00"
  };
  var augmentedSegment = augmentSegmentData(segment);  
  assert.equal(augmentedSegment.distance, 13.000);
  assert.equal(augmentedSegment.duration, "01:05:00");
  assert.equal(augmentedSegment.pace, "05:00");
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
  console.log("CONCLUSIE: " + JSON.stringify(augmentedSegment));
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
  console.log("CONCLUSIE: " + JSON.stringify(augmentedSegment));
  assert.equal(augmentedSegment.distance, 12.145);
  assert.equal(augmentedSegment.duration, "01:06:48");
  assert.equal(augmentedSegment.pace, "05:30");
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

test("createUuid should create a unique valid uuid", (assert) => {
  let uuid = createUuid();
  let uuid2 = createUuid();
  assert.equal(uuid.length, 36);
  assert.equal(uuid2.length, 36);
  assert.notEqual(uuid, uuid2);
  assert.end();
});