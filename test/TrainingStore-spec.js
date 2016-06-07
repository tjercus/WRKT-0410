
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
  let eventbus = new EventEmitter({wildcard: true, maxListeners: 1}); //sinon.spy();
  const store = new TrainingStore(eventbus);
  assert.equal(store.segments.length, 0);
  
  // ask store to load training
  eventbus.emit("TRAINING_LOAD_CMD", "training-uuid");
  assert.equal(store.segments.length, 3);

  store.removeSegment({"uuid": "blah-11"});
  assert.equal(store.segments.length, 2);
  // TODO assert spy was called
  assert.end();
});
