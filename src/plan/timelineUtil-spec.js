/**
 * @Tests for {@link TimelineStore.js}
 */
import test from "tape";
import {
  findDay,
  flattenDays,
  removeTrainingsFromDay,
  augmentDay,
  cloneDay,
  deleteDay,
  moveDay, cleanTrainingInstances
}
  from "./timelineUtil";
import {hasProperty} from "object-utils-2";

let plan = {
  "uuid": "91556686-232b-11e6-8b5a-5bcc30180900",
  "name": "10k plan #1",
  "days": [
    { "uuid": "1", "instanceId": "blah-10" },
    { "uuid": "2", "instanceId": "blah-11" },
    { "uuid": "3", "instanceId": "blah-12" },
    { "uuid": "4", "instanceId": "blah-13" },
    { "uuid": "5", "instanceId": "blah-14" },
    { "uuid": "6", "instanceId": "blah-15" }, {
      "uuid": "7",
      "trainings": [
        { "instanceId": "blah-16" },
        { "instanceId": "blah-19" }
      ]
    },
    { "uuid": "8", "instanceId": "blah-17" },
    { "uuid": "9", "instanceId": "blah-18" }
  ]
};

let trainingInstances = [{
  "uuid": "blah-10",
  "name": "name10",
  "type": "workout",
  "segments": [
    { "uuid": "99", "distance": 2.000, "duration": "00:11:00", trainingUuid: "blah-10" },
    { "uuid": "100", "distance": 1.600, "pace": "@10KP" }
  ]
}, {
  "uuid": "blah-11",
  "name": "name11",
  "type": "workout",
  "segments": [
    { "uuid": "101", "distance": 2.000, "duration": "00:11:00" },
    { "uuid": "102", "distance": 1.600, "pace": "@10KP" }
  ]
}, {
  "uuid": "blah-12",
  "name": "name12",
  "type": "workout",
  "segments": [
    { "uuid": "103", "distance": 2.000, "duration": "00:11:00" },
    { "uuid": "104", "distance": 1.600, "pace": "@10KP" }
  ]
}, {
  "uuid": "blah-13",
  "name": "Easy run name-13",
  "type": "easy",
  "segments": [
    { "uuid": "105", "distance": 1.600, "pace": "@LRP" }
  ]
}, {
  "uuid": "blah-14",
  "name": "name-14",
  "type": "workout",
  "segments": []
}, {
  "uuid": "blah-15",
  "name": "name-15",
  "type": "workout",
  "segments": []
}, {
  "uuid": "blah-16",
  "name": "name-16",
  "type": "workout",
  "segments": []
}, {
  "uuid": "blah-17",
  "name": "name-17",
  "type": "workout",
  "segments": []
}, {
  "uuid": "blah-18",
  "name": "name-18",
  "type": "workout",
  "segments": []
}, {
  "uuid": "blah-19",
  "name": "name-19",
  "type": "workout",
  "segments": []
}];

const augmentedDays = plan.days.map((_day) => {
  return augmentDay(_day, trainingInstances);
});

test("augmentDay should augment a day with one traininginstance into a list of one trainings", (assert) => {
  const day = augmentDay(plan.days[2], trainingInstances); // blah-12
  assert.ok(typeof day === "object");
  assert.notOk(day === null);
  assert.notOk(day.hasOwnProperty("training"));
  assert.ok(day.hasOwnProperty("trainings"));
  assert.equal(day.trainings[0].name, "name12");

  assert.equal(day.trainings[0].segments[0].distance, 2.000);
  assert.equal(day.trainings[0].segments[0].duration, "00:11:00");
  assert.equal(day.trainings[0].segments[0].pace, "05:30");

  assert.ok(day.trainings[0].hasOwnProperty("total"));
  assert.equal(day.trainings.length, 1, "not enough trainings (" + day.trainings.length + ") where found");
  assert.end();
});

test("augmentDay should augment a day with two traininginstances", (assert) => {
  const day = augmentDay(plan.days[6], trainingInstances);
  assert.ok(typeof day === "object");
  assert.notOk(day === null);
  assert.equal(day.trainings[0].name, "name-16");
  assert.equal(day.trainings[1].name, "name-19");
  assert.equal(day.trainings.length, 2, "not enough trainings (" + day.trainings.length + ") where found");
  assert.end();
});

test("findDay should find a day by nr", (assert) => {
  const day = findDay(2, plan, trainingInstances);
  assert.notOk(day === null);
  assert.ok(typeof day === "object");
  assert.equal(day.uuid, "2");  
  assert.end();
});

test("findDay should throw Error when a day could not be found by nr", (assert) => {
  try {
    findDay("999999", plan, trainingInstances);
  } catch (error) {
    assert.equal(error.message, "findDay could not find day with 999999");
  }
  assert.end();
});

// TODO exception flows

test("flattenDays should flatten an augmented array of days", (assert) => {  
  const flattened = flattenDays(augmentedDays);
  assert.equal(flattened[4].uuid, "5");
  assert.notOk(flattened[4].trainings[0].hasOwnProperty("uuid"));
  assert.ok(flattened[4].trainings[0].hasOwnProperty("instanceId"));
  assert.equal(flattened[4].trainings[0].instanceId, "blah-14");
  assert.equal(flattened.length, augmentedDays.length, "resulting array should be of the same size");
  assert.end();
});

test("removeTrainingsFromDay should remove an instance from a day in a list of days", (assert) => {
  const newDays = removeTrainingsFromDay("6", augmentedDays);

  let trainingWasRemoved = false;
  newDays.forEach((_day) => {
    if (_day.uuid == 6) {
      if (_day.trainings[0].name === "No Run") {
        trainingWasRemoved = true;
      }
    }
  });
  assert.ok(trainingWasRemoved, "training was not removed from day");
  assert.equal(newDays.length, 9, "same amount of days should remain");
  assert.end();
});

test("removeTrainingsFromDay should remove a training from a day when there are multiple", (assert) => {
  const newDays = removeTrainingsFromDay("7", augmentedDays);
  assert.equal(newDays.length, 9, "same amount of days should remain");  
  assert.end();
});

test("cloneDay should clone a day if it is augmented", (assert) => {
  const day = augmentedDays[0];
  const cloner = cloneDay(day);
  assert.notEqual(cloner.uuid, day.uuid, "clone should have it's own uuid");
  assert.notEqual(cloner.trainings[0].uuid, day.trainings[0].uuid, "clones training should have its oswn uuid");
  assert.equal(cloner.trainings[0].name, day.trainings[0].name, "clones training should have same name");
  assert.end();
});

test("cloneDay should clone a day if it has multiple trainings", (assert) => {  
  const day = augmentedDays[6];
  const cloner = cloneDay(day);
  assert.notEqual(cloner.uuid, day.uuid, "clone should have it's own uuid");
  assert.notEqual(cloner.trainings[0].uuid, day.trainings[0].uuid, "clones first training should have its own uuid");
  assert.equal(cloner.trainings[0].name, day.trainings[0].name, "clones first training should have same name");
  assert.end();
});


test("deleteDay should delete a day when it exists", (assert) => {
  const days = deleteDay("4", augmentedDays);
  assert.equal(days.length, augmentedDays.length - 1, "should be one day less");
  assert.end();
});

test("deleteDay should not delete a day when it does not exists", (assert) => {
  const days = deleteDay("1297-not-exists-3878", augmentedDays);
  assert.equal(days.length, augmentedDays.length, "should be same nr of days as before");
  assert.end();
});

test("moveDay should move a day earlier when a negative position integer is provided", (assert) => {
  const days = moveDay(2, augmentedDays, -1);
  assert.equal(days[0].uuid, "2", "originally first day should be at position two");
  assert.equal(days[1].uuid, "1", "originally second day should be at position one");
  assert.end();
});

test("moveDay should move a day later when a position integer is provided", (assert) => {
  const days = moveDay(1, augmentedDays, 1);
  assert.equal(days[0].uuid, "2", "originally first day should be at position two");
  assert.equal(days[1].uuid, "1", "originally second day should be at position one");
  assert.end();
});

test("cleanTrainingInstances should remove trainingUuids from segments in a list of traininginstances", (assert) => {
  const cleanedInstances = cleanTrainingInstances(trainingInstances);
  assert.ok(typeof cleanedInstances === "object");
  assert.notOk(cleanedInstances === null);
  assert.notOk(hasProperty(trainingInstances[0].segments[0], "trainingUuid"));

  assert.end();
});
