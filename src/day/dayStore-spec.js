/**
 * Created by tvalentijn on 4/14/17.
 */

import test from "tape";
import { clone } from "object-utils-2";
import EventEmitter from "eventemitter4";
import sinon from "sinon";
import dayStore from "./dayStore";
/**
 * Tests for {@link dayStore.js}
 */

let day = {
  uuid: "2a63ef62-test-4b92-8971-59db6e58394c",
  trainings: [
    {
      uuid: "4898",
      segments: [
        {
          uuid: "66666",
          trainingUuid: "4898",
          total: {
            distance: 1.0,
            duration: "00:05:00",
            pace: "05:00",
          },
        },
      ],
    },
  ],
};

test("dayStore should listen to SEGMENT_GET_CMD", assert => {
  let eventbus = new EventEmitter({ wildcard: true, maxListeners: 3, verbose: true });
  let emitSpy = sinon.spy(eventbus, "emit");
  const store = dayStore(eventbus);

  eventbus.emit("DAY_LOAD_CMD", day, new Date());
  assert.ok(emitSpy.calledWith("DAY_LOAD_EVT"));

  eventbus.emit("SEGMENT_GET_CMD", "66666", "4898");
  // assert.equal(store.day.uuid, "acc3d1b8-test-4d70-dda3-d0e885f516f4", "plan should be loaded in store");
  assert.ok(emitSpy.calledWith("SEGMENT_GET_CMD"));
  assert.end();
});
