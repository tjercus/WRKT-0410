
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

  // assert.equal(emitSpy.getCall(0).args[1], "TRAINING_LIST_CMD");
  // assert.equal(emitSpy.getCall(1).args[1], "TRAINING_LOAD_CMD");
  // assert.equal(emitSpy.getCall(2).args[1], "TRAINING_CLEAR_CMD");
  // assert.equal(emitSpy.getCall(3).args[1], "SEGMENT_UPDATE_CMD");
  // assert.equal(emitSpy.getCall(4).args[1], "SEGMENT_ADD_CMD");
  // assert.equal(emitSpy.getCall(5).args[1], "SEGMENT_REMOVE_CMD");
  // assert.equal(emitSpy.getCall(6).args[1], "SEGMENT_CLONE_CMD");
  // assert.equal(emitSpy.getCall(7).args[1], "SEGMENT_REMOVE_EVT");
  
  assert.ok(emitSpy.calledWith("SEGMENT_REMOVE_EVT"));

  // remove segment 107 from testdata
  segments.splice(8, 1);

  for (let i = 0, len = emitSpy.args.length; i < len; i++) {    
    if (emitSpy.args[i][0] === "SEGMENT_REMOVE_EVT") {      
      assert.equal(emitSpy.args[i][1].segments.length, segments.length, 
        "after deleting, there should be 9 segments");
    }
  }  
  assert.end();  
});
