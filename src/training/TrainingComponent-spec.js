import makeDom from "../shell/dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import TrainingComponent from "./TrainingComponent";
import SegmentContainer from "./SegmentContainer";
// specific dependencies for CUT
import EventEmitter from "eventemitter4";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
const emitSpy = sinon.spy(eventbus, "emit");
const onSpy = sinon.spy(eventbus, "on");
const segments = [{
  uuid: "uuid-segment1",
  distance: 5.0,
  duration: "00:20:00",
  pace: "04:00"
}];
const training = { uuid: "uuid-training1", name: "my training", type: "easy", segments: segments, total: { distance: 5.1, duration: "01:23:45", pace: "03:59" } };

test("TrainingComponent should initially render with an info message", (assert) => {
  let eventbus = sinon.spy();
  const component = shallow(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  assert.equal(component.find("div").text(), "Please choose a training from the left-hand list");
  assert.end();
});

test("TrainingComponent should render a training", (assert) => {
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  assert.equal(component.find("header.panel-header span").text(), "my training");
  assert.equal(component.find("fieldset[name='type'] button").length, 2, "should be two buttons to set 'type' of training");
  assert.equal(component.find("SegmentContainer").length, 1);
  assert.equal(component.find("output[name='totals']").length, 1);
  assert.equal(component.find("menu").length, 4);
  const buttons = component.find("menu button");
  assert.equal(buttons.first().text(), "add empty segment");
  assert.equal(buttons.at(1).text(), "add to begin of plan");
  assert.equal(buttons.at(2).text(), "add to middle of plan");
  assert.equal(buttons.at(3).text(), "add to end of plan");
  assert.equal(buttons.at(4).text(), "add to selected week");
  assert.equal(buttons.at(5).text(), "export training");
  assert.equal(buttons.at(6).text(), "clear training");
  assert.equal(buttons.at(7).text(), "clone training");
  assert.equal(buttons.at(8).text(), "remove training");
  assert.equal(buttons.at(9).text(), "persist changes");

  assert.end();
});

test("TrainingComponent should emit a TRAINING_CLONE_CMD", (assert) => {
  emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  component.find("menu button").at(7).simulate("click");
  assert.ok(emitSpy.calledWith("TRAINING_CLONE_CMD"), "component should emit TRAINING_CLONE_CMD");
  assert.end();
});

test("TrainingComponent should allow a toggle of trainingname as editable component", (assert) => {
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  const BUTTON_SELECTOR = "button[id='edit-name-button']";
  const TEXTFIELD_SELECTOR = "input[id='edit-name-textfield']";
  eventbus.emit("TRAINING_LOAD_EVT", training);
  assert.equal(component.find(BUTTON_SELECTOR).length, 1, "initially: edit button visible");
  assert.equal(component.find(TEXTFIELD_SELECTOR).length, 0, "initially: inputfield not visible");
  component.find(BUTTON_SELECTOR).simulate("click");
  assert.equal(component.find(BUTTON_SELECTOR).length, 1, "after click 1: button still visible");
  assert.equal(component.find(TEXTFIELD_SELECTOR).length, 1, "after click 1: textfield visible");
  component.find(BUTTON_SELECTOR).simulate("click");
  assert.equal(component.find(BUTTON_SELECTOR).length, 1, "after click 2: button still visible");
  assert.equal(component.find(TEXTFIELD_SELECTOR).length, 0, "after click 2: textfield not visible");
  assert.end();
});

test("TrainingComponent should emit a TRAINING_UPDATE_CMD", (assert) => {
  emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  const BUTTON_SELECTOR = "button[id='edit-name-button']";
  const TEXTFIELD_SELECTOR = "input[id='edit-name-textfield']";
  eventbus.emit("TRAINING_LOAD_EVT", training);
  component.find(BUTTON_SELECTOR).simulate("click");
  component.find(TEXTFIELD_SELECTOR).simulate("blur");
  assert.ok(emitSpy.calledWith("TRAINING_UPDATE_CMD"), "component should emit TRAINING_UPDATE_CMD");
  assert.end();
});

test("TrainingComponent should emit a TRAININGS_PERSIST_CMD", (assert) => {
  emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  component.find("button[id='persist-button']").simulate("click");
  assert.ok(emitSpy.calledWith("TRAININGS_PERSIST_CMD"), "component should emit TRAININGS_PERSIST_CMD");
  assert.end();
});

test("TrainingComponent should update total after a SEGMENT_UPDATE_EVT", (assert) => {
  const segment = {
    uuid: "uuid-segment2",
    distance: 10,
    duration: "00:40:00",
    pace: "04:00"
  };
  const total = {
    distance: 10,
    duration: "00:40:00",
    pace: "04:00"
  };
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  // increase distance and empty duration
  const segmentContainer = component.find(SegmentContainer).get(0);
  segmentContainer.setState({distance: 10, duration: ""});
  eventbus.emit("SEGMENT_UPDATE_EVT", {uuid: training.uuid, segment: segment, total: total});
  // check total in GUI/state
  assert.equal(component.state("total").distance, 10);
  assert.equal(component.state("total").duration, "00:40:00");
  assert.equal(component.state("total").pace, "04:00");
  assert.end();
});

test("TrainingComponent should pre-select a button for the right type of training", (assert) => {
  //emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  //component.find("button[id='persist-button']").simulate("click");
  assert.ok(component.find("button[value='easy']").hasClass("button-choice-selected"), "easy button should be selected");
  assert.notOk(component.find("button[value='workout']").hasClass("button-choice-selected"), "easy button should not be selected");
  //assert.ok(emitSpy.calledWith("TRAININGS_PERSIST_CMD"), "component should emit TRAININGS_PERSIST_CMD");
  assert.end();
});

test("TrainingComponent should mark a 'group choice button' for the right type of training", (assert) => {
  //emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  component.find("button[value='workout']").simulate("click");
  assert.ok(component.find("button[value='workout']").hasClass("button-choice-selected"));
  assert.notOk(component.find("button[value='easy']").hasClass("button-choice-selected"));
  assert.end();
});

test("TrainingComponent should emit a TRAINING_TO_PLAN_CMD", (assert) => {
  emitSpy.reset();
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);
  // assert.equals("wobble", component.html());
  component.find("button[value='add-to-plan']").simulate("click");
  assert.ok(emitSpy.calledWith("TRAINING_TO_PLAN_CMD"), "component should emit TRAINING_TO_PLAN_CMD");
  assert.end();
});
