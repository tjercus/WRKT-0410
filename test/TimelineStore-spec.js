
import test from "tape";
import TimelineStore from "../src/stores/TimelineStore";
import EventEmitter from "eventemitter2";
import sinon from "sinon";
/**
 * Tests for {@link TimelineStore.js}
 */

let traininginstances = [
  {
    "uuid": "2a63ef62-test-4b92-8971-59db6e58394c",
    "name": "Easy run",
    "type": "easy",
    "segments": [
      {
        "uuid": "48",
        "distance": 6,
        "pace": "05:00"
      }
    ]
  },
];
let plans = [];
let plan = {
  "uuid": "acc3d1b8-test-4d70-dda3-d0e885f516f4",
  "name": "10k plan #1",
  "microcycles": [
    {"days": [
      {"nr": "1", "instanceId": "2a63ef62-test-4b92-8971-59db6e58394c"}    
    ]}
  ]
}
plans.push(plan);

test("TimelineStore should listen to TRAINING_CLONE_AS_INSTANCE_CMD and add instance to plan", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus, plans, traininginstances);  

  eventbus.emit("PLAN_LOAD_CMD", "acc3d1b8-test-4d70-dda3-d0e885f516f4");

  let training = {
    name: "another training",
    type: "workout",
    segments: [
      {
        "uuid": "986633433",
        "distance": 12,
        "pace": "05:30"
      }
    ]
  }
  eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", training);

  let currentMicrocycle = store.microcycles.splice(-1)[0];
  assert.equal(currentMicrocycle.days.length, 2, "instance should be added to plan");  
  assert.end();
});

test("TimelineStore should add a day and a new week when a microcycle is full", (assert) => {
  assert.end();
});