
import test from "tape";
import {clone} from "object-utils-2";
import timelineStore from "./timelineStore";
import EventEmitter from "eventemitter4";
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
    {
      "uuid": "1",
      "trainings": [
        {"instanceId": "2a63ef62-test-4b92-8971-59db6e58394c"}
      ]
    }
  ]
};

const makePlanClone = () => clone(plan);

test("TimelineStore should listen to PLAN_FETCH_EVT and load plan and instances", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  timelineStore(eventbus);

  eventbus.on("PLAN_LOAD_EVT", (plan) => {
    assert.equal(plan.uuid, "acc3d1b8-test-4d70-dda3-d0e885f516f4", "plan should be loaded in store");
    assert.equal(plan.days.length, 1, "plan.days should be loaded in store");
    assert.equal(plan.days[0].trainings.length, 1, "plan.days should be augmented");
    assert.equal(plan.days[0].trainings[0].name, "Easy run", "plan.days should be augmented");
    // assert.equal(traininginstances.length, 1, "instance should be loaded in store");
    assert.end();
  });

  eventbus.emit("PLAN_FETCH_EVT", [makePlanClone(), traininginstances]);
});

test("TimelineStore should listen to PLAN_PERSIST_CMD emit plan and instances", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 9, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  timelineStore(eventbus);
  eventbus.emit("PLAN_FETCH_EVT", [makePlanClone(), traininginstances]);

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
  timelineStore(eventbus);

  eventbus.on("TRAINING_TO_PLAN_EVT", (plan) => {
    assert.equal(plan.days.length, 2, "instance should be added to plan");
    assert.end();
  });
  eventbus.on("PLAN_LOAD_EVT", (plan) => {
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
    };
    eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", training);
  });

  eventbus.emit("PLAN_FETCH_EVT", [makePlanClone(), traininginstances]);
});

test("TimelineStore should listen to TRAINING_CLONE_AS_INSTANCE_CMD and add instance to the BEGIN of plan", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const store = timelineStore(eventbus);

  eventbus.on("TRAINING_TO_PLAN_EVT", (plan) => {
    assert.equal(plan.days.length, 2, "instance should be added to plan");
    assert.equal(plan.days[0].trainings[0].name, "another training 2", "training should be added to a new day at the BEGIN of plan");
    assert.end();
  });

  eventbus.on("PLAN_LOAD_EVT", (plan) => {
    let training = {
      uuid: "3945-kjgfdf",
      name: "another training 2",
      type: "workout",
      segments: [
        {
          "uuid": "986633433",
          "distance": 12,
          "pace": "05:30"
        }
      ]
    };
    eventbus.emit("TRAINING_CLONE_AS_INSTANCE_CMD", training, 0);
  });

  eventbus.emit("PLAN_FETCH_EVT", [makePlanClone(), traininginstances]);
});

test("TimelineStore should listen to DAY_CLONE_CMD with position", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  timelineStore(eventbus);

  eventbus.on("DAY_CLONE_EVT", (plan) => {
    assert.equal(plan.days.length, 2, "day should be added to plan");
    assert.equal(plan.days[1].uuid, "1", "cloned original day should now be at second position");
    assert.end();
  });

  eventbus.on("PLAN_LOAD_EVT", (plan) => {
    assert.equal(plan.days.length, 1, `initially there should be one day: ${plan.days[0].uuid}`);
    eventbus.emit("DAY_CLONE_CMD", 1, 0);
  });
  
  // setTimeout(() => {
  // }, 2000);
  eventbus.emit("PLAN_FETCH_EVT", [makePlanClone(), traininginstances]);
});
