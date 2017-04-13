import test from "tape";
import sinon from "sinon";
import TrainingStore from "./TrainingStore";
import EventEmitter from "eventemitter4";

/**
 * Tests for {@link TrainingStore.js}
 */
let segments = [
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
let training = {
  "uuid": "training-uuid",
  "name": "training-name",
  "type": "workout",
  "segments": segments
};

test("TrainingStore should load and emit training after receiving TRAINING_LOAD_CMD", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");

  assert.equal(store.uuid, "training-uuid", "store should have uuid");
  assert.equal(store.name, "training-name", "store should have name");
  assert.equal(store.type, "workout", "store should have type");

  // TODO turn this into a util
  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "TRAINING_LOAD_EVT") {
      const emittedTraining = emitSpy.args[i][1];
      assert.equal(emittedTraining.segments.length, 10, "after loading, there should be 10 segments");
      assert.equal(emittedTraining.uuid, training.uuid, "uuid should match");
      assert.equal(emittedTraining.name, training.name, "name should match");
      assert.equal(emittedTraining.type, training.type, "type should match");
    }
  }
  assert.end();
});

test("TrainingStore removeSegment should emit a properly payloaded event", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");

  store.removeSegmentFromStore({ "uuid": "107" }, segments);

  assert.ok(emitSpy.calledWith("SEGMENT_REMOVE_EVT"));
  // remove segment 107 from testdata
  segments.splice(8, 1);

  // TODO turn this into a util
  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "SEGMENT_REMOVE_EVT") {
      assert.equal(emitSpy.args[i][1].segments.length, segments.length,
        "after deleting, there should be 9 segments");
    }
  }
  assert.end();
});

test("TrainingStore should listen to TRAINING_CLEAR_CMD and empty store", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  assert.equal(store.uuid, training.uuid, "loaded training should have proper uuid");
  eventbus.emit("TRAINING_CLEAR_CMD");
  assert.equal(store.uuid, null, "cleared training should have null uuid");
  assert.equal(store.name, null, "cleared training should have null name"); // TODO or string 'undefined'?
  assert.equal(store.type, null, "cleared training should have null type");
  assert.equal(store.segments.length, 0, "cleared training should have no segments");
  assert.equal(store.total.distance, 0, "cleared training should have 0 distance");
  assert.equal(store.total.duration, "00:00:00", "cleared training should have empty duration");
  assert.equal(store.total.pace, "00:00", "cleared training should have empty pace");

  assert.end();
});

test("TrainingStore should listen to TRAINING_CLONE_CMD and clone", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  eventbus.emit("TRAINING_CLONE_CMD");

  assert.notEqual(store.uuid, training.uuid, "cloned training should have different uuid loaded in store");

  assert.end();
});

test("TrainingStore should listen to TRAINING_UPDATE_CMD and refresh list", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  training.name = "wobble";
  training.type = "easy";
  eventbus.emit("TRAINING_UPDATE_CMD", training);

  assert.equal(store.name, "wobble", "new name should be copied in store");
  assert.equal(store.type, "easy", "new type should be copied in store");

  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "TRAINING_UPDATE_EVT") {
      assert.equal(emitSpy.args[i][1].training.name, "wobble",
        "after updating a training, the new version should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].trainings[0].name, "wobble",
        "with an update event the new name should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].trainings[0].type, "easy",
        "with an update event the new type should be emitted on the bus");
    }
  }
  assert.end();
});

test("TrainingStore should listen to TRAINING_TO_PLAN_CMD and emit TRAINING_CLONE_AS_INSTANCE_CMD", (assert) => {
    let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  eventbus.emit("TRAINING_TO_PLAN_CMD");

  assert.ok(emitSpy.calledWith("TRAINING_CLONE_AS_INSTANCE_CMD"));
  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "TRAINING_CLONE_AS_INSTANCE_CMD") {
      assert.equal(emitSpy.args[i][1].name, "wobble", "the current training should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].type, "easy", "the current training should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].segments.length, 9, "the current training should be emitted on the bus");
    }
  }
  assert.end();
});

test("TrainingStore should listen to SEGMENT_UPDATE_CMD", (assert) => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training with segments via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  const updatableSegment = { "uuid": "100", "distance": 10, "pace": "@5KP" }

  eventbus.emit("SEGMENT_UPDATE_CMD", updatableSegment);

  for (let i = 0, len = emitSpy.args.length; i < len; i++) {
    if (emitSpy.args[i][0] === "SEGMENT_UPDATE_EVT") {
      assert.equal(emitSpy.args[i][1].segment.uuid , "100",
        "after updating a segment the new version should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].segment.distance, 10,
        "with an update event the new distance should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].segment.pace, "03:33",
        "with an update event the new pace should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].segment.duration, "00:35:30",
        "with an update event the new duration should be emitted on the bus");
    }
  }
  assert.end();
});

/* // TODO enable after introducing fetch for Node.js or overwrite import for fetch
test("should listen to TRAININGS_PERSIST_CMD and write to disk", (assert) => {
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 3, verbose: true});
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  eventbus.emit("TRAININGS_PERSIST_CMD");
  assert.ok(emitSpy.calledWith("TRAININGS_PERSIST_EVT"));
  assert.end();
});
*/
