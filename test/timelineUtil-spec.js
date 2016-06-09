import test from "tape";
import {findPlan, findDay, filterNonEasyDays} from "../src/stores/timelineUtil";

/**
 * Tests for {@link TimelineStore.js}
 */
let plans = [{
  "uuid": "91556686-232b-11e6-8b5a-5bcc30180900",
  "name": "10k plan #1",
  "days": [
    {"nr": 1, "workout": "blah-10"},
    {"nr": 2, "workout": "blah-12"},
    {"nr": 3, "workout": "blah-13"}
  ]
}];

let trainings = [{
    "uuid": "blah-10",
    "name": "name10",
    "segments": [
      {"uuid": "99", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "100", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-11",
    "name": "name11",
    "segments": [
      {"uuid": "101", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "102", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-12",
    "name": "name12",
    "segments": [
      {"uuid": "103", "distance": 2.000, "duration": "00:11:00"},
      {"uuid": "104", "distance": 1.600, "pace": "@10KP"}      
    ]
},{
    "uuid": "blah-13",
    "name": "Easy run name-13",
    "segments": [      
      {"uuid": "105", "distance": 1.600, "pace": "@LRP"}
    ]
}];

test("findPlan should find the default plan", (assert) => {
  let plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainings);
  assert.ok(typeof plan === "object");  
  assert.notOk(plan === null);
  assert.equal(plan.name, "10k plan #1");
  assert.equal(plan.days[0].workout.name, "name10", "workout for a day has incorrect name");
  assert.equal(plan.days[0].workout.uuid, "blah-10", "workout for a day has incorrect uuid");
  assert.equal(plan.days.length, 3, "not enough days where found");
  assert.equal(plan.days[0].workout.segments.length, 2, "workout for a day has no segments");
  assert.equal(plan.days[0].workout.segments[0].uuid, "99", "workout segment has no uuid");  
  assert.end();
});

// TODO exception flows

test("findDay should find a day by nr", (assert) => {
  console.log("@ " + JSON.stringify(plans[0]));
  let days = plans[0]["days"];
  assert.equal(days.length, 3, "not enough days where found");
  assert.notOk(days[0] === null, "day not found in testdata");
  let day = findDay(2, days, trainings);
  assert.ok(typeof day === "object");  
  assert.equal(day.nr, 2);
  assert.notOk(day === null);
  assert.equal(day.workout.uuid, "blah-12");
  assert.equal(day.workout.name, "name12");
  assert.end();
});

// TODO exception flows

test("filterNonEasyDays should return non-easy days", (assert) => {
  let plan = findPlan("91556686-232b-11e6-8b5a-5bcc30180900", plans, trainings);
  let days = plan.days;
  let nonEasyDays = filterNonEasyDays(days);
  assert.equal(nonEasyDays.length, 2, "not enough days where found");
  assert.end();
});
