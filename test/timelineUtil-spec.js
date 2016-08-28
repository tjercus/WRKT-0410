import test from "tape";
import {findPlan, findDay, flattenDays, removeTrainingFromDay, augmentDay, 
  cloneDay, deleteDay, moveDay} 
from "../src/stores/timelineUtil";

/**
 * Tests for {@link TimelineStore.js}
 */
let plans = [{
  "uuid": "91556686-232b-11e6-8b5a-5bcc30180900",
  "name": "10k plan #1",
  "days": [    
    {"uuid": "1", "instanceId": "blah-10"},
    {"uuid": "2", "instanceId": "blah-11"},
    {"uuid": "3", "instanceId": "blah-12"},
    {"uuid": "4", "instanceId": "blah-13"},
    {"uuid": "5", "instanceId": "blah-14"},
    {"uuid": "6", "instanceId": "blah-15"},
    {"uuid": "7", "trainings": [
      {"instanceId": "blah-16"},
      {"instanceId": "blah-19"}]
    },
    {"uuid": "8", "instanceId": "blah-17"},
    {"uuid": "9", "instanceId": "blah-18"}
  ]
}];

let trainingInstances = [{
    "uuid": "blah-10",
    "name": "name10",
    "type": "workout",
    "segments": [
      {"uuid": "99", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "100", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-11",
    "name": "name11",
    "type": "workout",
    "segments": [
      {"uuid": "101", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "102", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-12",
    "name": "name12",
    "type": "workout",
    "segments": [
      {"uuid": "103", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "104", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-13",
    "name": "Easy run name-13",
    "type": "easy",
    "segments": [      
      {"uuid": "105", "distance": 1.600, "pace": "@LRP"}
    ]
},{
    "uuid": "blah-14",
    "name": "name-14",
    "type": "workout",
    "segments": []
},{
    "uuid": "blah-15",
    "name": "name-15",
    "type": "workout",
    "segments": []
},{
    "uuid": "blah-16",
    "name": "name-16",
    "type": "workout",
    "segments": []
},{
    "uuid": "blah-17",
    "name": "name-17",
    "type": "workout",
    "segments": []
},{
    "uuid": "blah-18",
    "name": "name-18",
    "type": "workout",
    "segments": []
},{
    "uuid": "blah-19",
    "name": "name-19",
    "type": "workout",
    "segments": []
}];

test("findPlan should find and augment the default plan", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  assert.ok(typeof plan === "object");  
  assert.notOk(plan === null);
  assert.equal(plan.name, "10k plan #1");
  assert.equal(plan.days.length, 9, "not enough days (" + plan.days.length + ") where found");
  assert.equal(plan.days[0].training.name, "name10", "training for a day has incorrect name");
  assert.equal(plan.days[0].training.uuid, "blah-10", "training for a day has incorrect uuid");  
  assert.equal(plan.days[0].training.segments.length, 2, "training for a day has no segments");
  assert.equal(plan.days[0].training.segments[0].uuid, "99", "training segment has no uuid");  
  assert.end();
});

// TODO exception flows

test("augmentDay should augment a day with two traininginstances", (assert) => {
  const day = augmentDay(plans[0].days[6], trainingInstances);
  assert.ok(typeof day === "object");  
  assert.notOk(day === null);
  assert.equal(day.trainings[0].name, "name-16");
  assert.equal(day.trainings[1].name, "name-19");
  assert.equal(day.trainings.length, 2, "not enough trainings (" + day.trainings.length + ") where found");
  assert.end();
});

test("findDay should find a day by nr", (assert) => {
  //console.log("@ " + JSON.stringify(plans[0]));  
  const day = findDay(2, plans[0], trainingInstances);
  assert.notOk(day === null);
  assert.ok(typeof day === "object");    
  assert.equal(day.uuid, "2");
  assert.equal(day.training.uuid, "blah-11");
  assert.equal(day.training.name, "name11");
  assert.end();
});

// TODO exception flows

test("flattenDays should flatten an augmented array of days", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const flattened = flattenDays(plan.days);
  assert.equal(flattened[4].uuid, "5");
  assert.equal(flattened[4].instanceId, "blah-14");
  assert.equal(flattened.length, plan.days.length, "resulting array should be of the same size");
  assert.end();
});

test("removeTrainingFromDay should remove an instance from a day in a list of days", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const newDays = removeTrainingFromDay(6, plan.days);

  let trainingWasRemoved = false;
  newDays.forEach((_day) => {
    if (_day.uuid == 6) {
      if (_day.training.name === "No Run") {
        trainingWasRemoved = true;
      }
    }
  });
  assert.ok(trainingWasRemoved, "training was not removed from day");
  assert.equal(newDays.length, 9, "same amount of days should remain");
  assert.end();
});

test("cloneDay should clone a day if it is augmented", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const day = plan.days[0];
  const cloner = cloneDay(day);
  assert.notEqual(cloner.uuid, day.uuid, "clone should have it's own uuid");
  assert.notEqual(cloner.training.uuid, day.training.uuid, "clones training should have its own uuid");
  assert.equal(cloner.training.name, day.training.name, "clones training should have same name");
  assert.end();
});

test("cloneDay should clone a day if it has multiple trainings", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const day = plan.days[6];
  const cloner = cloneDay(day);
  assert.notEqual(cloner.uuid, day.uuid, "clone should have it's own uuid");
  assert.notEqual(cloner.trainings[0].uuid, day.trainings[0].uuid, "clones first training should have its own uuid");
  assert.equal(cloner.trainings[0].name, day.trainings[0].name, "clones first training should have same name");
  assert.end();
});


test("deleteDay should delete a day when it exists", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const days = deleteDay("4", plan.days);
  assert.equal(days.length, plans[0].days.length - 1, "should be one day less");
  assert.end();
});

test("deleteDay should not delete a day when it does not exists", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const days = deleteDay("1297-not-exists-3878", plan.days);
  assert.equal(days.length, plans[0].days.length, "should be same nr of days as before");
  assert.end();
});

test("moveDay should move a day earlier when a negative position integer is provided", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const days = moveDay(2, plan.days, -1);
  assert.equal(days[0].uuid, "2", "originally first day should be at position two");
  assert.equal(days[1].uuid, "1", "originally second day should be at position one");
  assert.end();
});

test("moveDay should move a day later when a position integer is provided", (assert) => {
  const plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainingInstances);
  const days = moveDay(1, plan.days, 1);
  assert.equal(days[0].uuid, "2", "originally first day should be at position two");
  assert.equal(days[1].uuid, "1", "originally second day should be at position one");
  assert.end();
});

