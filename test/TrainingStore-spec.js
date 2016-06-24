
import test from "tape";
import sinon from "sinon";
import TrainingStore from "../src/stores/TrainingStore";
import EventEmitter from "eventemitter2";

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
  "segments": segments
};

test("removeSegment should emit a properly loaded event", (assert) => {
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 3, verbose: true}); 
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  
  store.removeSegmentFromStore({"uuid": "107"}, segments);  
  
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

test("should listen to TRAINING_CLONE_CMD and clone", (assert) => {
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 3, verbose: true}); 
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  
  //store.removeSegmentFromStore({"uuid": "107"}, segments);
  // TODO fire clone event and assert stuff
  assert.end();
});

test("should listen to TRAINING_UPDATE_CMD and refresh list", (assert) => {
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 3, verbose: true}); 
  let emitSpy = sinon.spy(eventbus, "emit");
  const trainings = [];
  trainings.push(training);
  const store = new TrainingStore(eventbus, trainings);
  // ask store to load training via eventbus
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  training.name = "wobble";
  eventbus.emit("TRAINING_UPDATE_CMD", training);
  //assert.ok(emitSpy.calledWith("TRAINING_UPDATE_EVT"));

  for (let i = 0, len = emitSpy.args.length; i < len; i++) {    
    if (emitSpy.args[i][0] === "TRAINING_UPDATE_EVT") {      
      assert.equal(emitSpy.args[i][1].training.name, "wobble",
        "after updating a training, the new version should be emitted on the bus");
      assert.equal(emitSpy.args[i][1].trainings[0].name, "wobble",
        "after updating a training, an updated list of trainings should be emitted on the bus");
    }
  }  
  assert.end();
});

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