
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

let plan = {
  "uuid": "acc3d1b8-test-4d70-dda3-d0e885f516f4",
  "name": "10k plan #1",
  "days": [    
    {"uuid": "1", "instanceId": "2a63ef62-test-4b92-8971-59db6e58394c"}
  ]
}

let planCopy = clone(plan);

test("TimelineStore should listen to PLAN_FETCHED_EVT and load plan and instances", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus);  

  eventbus.emit("PLAN_FETCHED_EVT", [plan, traininginstances]);

  assert.equal(store.plan.uuid, "acc3d1b8-test-4d70-dda3-d0e885f516f4", "plan should be loaded in store");
  assert.equal(store.plan.days.length, 1, "plan.days should be loaded in store");
  assert.equal(store.plan.days[0].trainings.length, 1, "plan.days should be augmented");
  assert.equal(store.plan.days[0].trainings[0].name, "Easy run", "plan.days should be augmented");
  assert.equal(store.traininginstances.length, 1, "instance should be loaded in store");
  assert.end();
});

test("TimelineStore should listen to PLAN_PERSIST_CMD emit plan and instances", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus);
  eventbus.emit("PLAN_FETCHED_EVT", [plan, traininginstances]);

  eventbus.emit("PLAN_PERSIST_CMD");
  
  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "PLAN_AND_INSTANCES_PERSIST_CMD") {
      const emittedPlan = emitSpy.args[i][1];
      assert.equal(emittedPlan.uuid, "acc3d1b8-test-4d70-dda3-d0e885f516f4", "plan to persist should be present");
      assert.equal(emittedPlan.days.length, 1, "emitted plan should have days");
      const emittedInstances = emitSpy.args[i][2];
      assert.equal(emittedInstances.length, 1, "instances should be emitted too");
    }
  }  
  assert.end();
});

test("TimelineStore should listen to TRAINING_CLONE_AS_INSTANCE_CMD and add instance to plan", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus);
  eventbus.emit("PLAN_FETCHED_EVT", [plan, traininginstances]);

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

  assert.equal(store.plan.days.length, 2, "instance should be added to plan");
  assert.end();
});

test("TimelineStore should listen to TRAINING_CLONE_AS_INSTANCE_CMD and add instance to BEGIN of plan", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus);
  eventbus.emit("PLAN_FETCHED_EVT", [planCopy, traininginstances]);

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
  eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", training, 0);

  assert.equal(store.plan.days.length, 2, "instance should be added to plan");
  assert.equal(store.plan.days[0].name, "another workout", "training should be added to first day of plan");
  assert.end();
});

test("TimelineStore should listen to DAY_CLONE_CMD with position", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");  
  const store = new TimelineStore(eventbus);
  eventbus.emit("PLAN_FETCHED_EVT", [plan, traininginstances]);

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
  let newDay = {};
  newDay.uuid = "blah-999";
  newDay.trainings = [training];
  eventbus.emit("DAY_CLONE_CMD", newDay.uuid, 0);

  assert.equal(store.plan.days.length, 2, "day should be added to plan");
  assert.equal(store.plan.days[0].uuid, "blah-999", "day should be added to plan first");
  assert.end();
});
