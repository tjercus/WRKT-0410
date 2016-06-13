
import test from "tape";
//import sinon from "sinon";
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

test("removeSegment should find and destroy a segment", (assert) => {  
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 3, verbose: true}); 
  //sinon.spy();
  const trainings = [];
  trainings.push(training);  
  const store = new TrainingStore(eventbus, trainings);

  eventbus.on("TRAINING_LOAD_EVT", (obj) => {
    assert.equal(store.segments.length, 10, "should load 10 segments after TRAINING_LOAD_EVT");
  });

  eventbus.on("SEGMENT_REMOVE_EVT", (obj) => {
    assert.equal(store.segments.length, 9, "should hold 9 segments after SEGMENT_REMOVE_EVT");
  });  
  
  // ask store to load training
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  store.removeSegment({"uuid": "107"});
  assert.end();
  
  // TODO assert spy was called 
});