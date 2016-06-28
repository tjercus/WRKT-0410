
import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import SegmentComponent from "../src/components/SegmentComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
const emitSpy = sinon.spy(eventbus, "emit");
const segment = {
  uuid: "uuid-segment1",
  distance: 5.1,
  duration: "01:23:45",
  pace: "03:59"
};

test("SegmentComponent should render with empty values by default", (assert) => {
  assert.end();
});

test("SegmentComponent should set values after SEGMENT_UPDATE_EVT", (assert) => {
  assert.end();
});

test("SegmentComponent should emit SEGMENT_UPDATE_CMD when it can augment on calc button click", (assert) => {
  const augmentableSegment = {
    uuid: "uuid-segment2",
    distance: 5,
    duration: "",
    pace: "05:00"
  };  
  emitSpy.reset();
  const component = mount(<SegmentComponent eventbus={eventbus} segment={augmentableSegment} />);
  component.find(".segment button.button-primary").simulate("click");  
  assert.ok(emitSpy.calledWith("SEGMENT_UPDATE_CMD"), "component should emit SEGMENT_UPDATE_CMD");
  assert.end();
});

test("SegmentComponent should NOT emit SEGMENT_UPDATE_CMD when it can NOT augment on calc button click", (assert) => {  
  emitSpy.reset();
  const component = mount(<SegmentComponent eventbus={eventbus} segment={segment} />);
  component.find(".segment button.button-primary").simulate("click");  
  assert.notOk(emitSpy.calledWith("SEGMENT_UPDATE_CMD"), "component should NOT emit SEGMENT_UPDATE_CMD");
  assert.end();
});

test("SegmentComponent should emit SEGMENT_CLONE_CMD when button clicked", (assert) => {
  assert.end();
});

test("SegmentComponent should emit SEGMENT_REMOVE_CMD when button clicked", (assert) => {
  assert.end();
});

test("SegmentComponent should set css class 'invalid' when appropriate", (assert) => {
  assert.end();
});