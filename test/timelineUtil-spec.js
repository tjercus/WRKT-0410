import test from "tape";
import {findPlan, findDay} from "../src/stores/timelineUtil";

/**
 * Tests for {@link TimelineStore.js}
 */
let plans = [{
  "uuid": "91556686-232b-11e6-8b5a-5bcc30180900",
  "name": "10k plan #1",
  "microcycles": [
    {"days": [
      {"nr": 1, "trainingId": "blah-10"},
      {"nr": 2, "trainingId": "blah-11"},
      {"nr": 3, "trainingId": "blah-12"},
      {"nr": 4, "trainingId": "blah-13"},
      {"nr": 5, "trainingId": "blah-14"},
      {"nr": 6, "trainingId": "blah-15"},
      {"nr": 7, "trainingId": "blah-16"}
    ]}, 
    {"days": [
      {"nr": 8, "trainingId": "blah-17"},
      {"nr": 9, "trainingId": "blah-18"}
    ]}
  ]
}];

let trainings = [{
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
}];

test("findPlan should find and augment the default plan", (assert) => {
  let plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainings);
  assert.ok(typeof plan === "object");  
  assert.notOk(plan === null);
  assert.equal(plan.name, "10k plan #1");
  assert.equal(plan.microcycles[0].days.length, 7, "not enough days (" + plan.microcycles[0].days.length + ") where found in cycle 0");
  assert.equal(plan.microcycles[1].days.length, 2, "not enough days where found in cycle 1");
  assert.equal(plan.microcycles[0].days[0].training.name, "name10", "training for a day has incorrect name");
  assert.equal(plan.microcycles[0].days[0].training.uuid, "blah-10", "training for a day has incorrect uuid");  
  assert.equal(plan.microcycles[0].days[0].training.segments.length, 2, "training for a day has no segments");
  assert.equal(plan.microcycles[0].days[0].training.segments[0].uuid, "99", "training segment has no uuid");  
  assert.end();
});

// TODO exception flows

test("findDay should find a day by nr", (assert) => {
  console.log("@ " + JSON.stringify(plans[0]));
  let days = plans[0]["microcycles"][0]["days"];
  assert.equal(days.length, 7, "not enough days where found");
  assert.notOk(days[0] === null, "day not found in testdata");
  let day = findDay(2, days, trainings);
  assert.notOk(day === null);
  assert.ok(typeof day === "object");    
  assert.equal(day.nr, 2);  
  assert.equal(day.training.uuid, "blah-11");
  assert.equal(day.training.name, "name11");
  assert.end();
});

// TODO exception flows

