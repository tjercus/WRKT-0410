import test from "tape";
import { hasProperty } from "object-utils-2";
import {
  findTraining,  
  updateTraining,
  removeTrainingInstance,
  removeTrainingInstancesForDay,
  cloneTrainingInstanceInDay,
  cleanTraining,
} from "./trainingUtil";

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

test("findTraining should find a training by uuid", (assert) => {  
  let training = findTraining("blah-11", trainings);
  assert.equal(true, (typeof training === "object"));
  assert.equal(training.uuid, "blah-11");
  assert.equal(training.name, "name11");
  assert.end();
});

test("findTraining should return null when not found", (assert) => {  
  let training = findTraining("125-456", trainings);  
  assert.equal(training, null);
  assert.end();
});

test("updateTraining should find and update training by uuid", (assert) => {  
  let training = {
    uuid: "blah-11",
    name: "name11-mod"
  };
  const newTrainings = updateTraining(training, trainings);
  assert.equal(newTrainings[1].uuid, "blah-11");
  assert.equal(newTrainings[1].name, "name11-mod");
  assert.equal(newTrainings.length, 3, "should have three trainings");

  assert.end();
});

test("removeTrainingInstancesForDay should delete all instances linked in a day", (assert) => {
  assert.equal(trainings.length, 3, "initial size of list");
  const trainingInstances = removeTrainingInstancesForDay(days[0], trainings);
  assert.equal(trainingInstances.length, 1, "two out of three should be removed");
  assert.end();
});

test("cloneTrainingInstancesInDay should clone an existing instance in a day", (assert) => {
  assert.equal(days[0].trainings.length, 2, "initial size of list");
  const day = cloneTrainingInstanceInDay(days[0], "blah-10");
  assert.equal(day.trainings.length, 3, "should find 3 trainings");
  assert.end();
});

test("removeTrainingInstance should not delete when day is not found", (assert) => {
  assert.equal(trainings.length, 3, "initial size of list");
  const trainingInstances = removeTrainingInstance("123-not-exists-456", trainings);
  assert.equal(trainingInstances.length, 3, "nothing should be removed");
  assert.end();
});

test("cleanTraining should remove trainingUuid property", (assert) => {  
  let training = findTraining("blah-10", trainings);
  training.segments = [];
  training.segments.push({
    uuid: "seg-10",
    trainingUuid: "blah-10",
    distance: 12,
    duration: "01:00:00",
    pace: "05:00",    
  });
  const cleanedTraining = cleanTraining(training);
  assert.equal(cleanedTraining.segments[0].uuid, "seg-10");
  assert.false(hasProperty(cleanedTraining, "trainingUuid"));

  assert.end();
});
