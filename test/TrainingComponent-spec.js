import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import TrainingComponent from "../src/components/TrainingComponent";
import SegmentComponent from "../src/components/SegmentComponent";
import { events } from "../src/components/constants";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
const segments = [{
  uuid: "uuid-segment1",
  distance: 5.1,
  duration: "01:23:45",
  pace: "03:59"
}];
const training = { uuid: "uuid-training1", name: "my training", segments: segments, total: { distance: 5.1, duration: "01:23:45", pace: "03:59" } };  

test("TrainingComponent should initially render with an info message", (assert) => {
  let eventbus = sinon.spy();
  const component = shallow(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  assert.equal(component.find("div").text(), "Please choose a training from the left-hand list");
  assert.end();
});

test("TrainingComponent should catch a MENU_CLICK_EVT", (assert) => {
  const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
  const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("MENU_CLICK_EVT", "Training");  
  assert.ok(onSpy.calledWith("MENU_CLICK_EVT"), "component should catch MENU_CLICK_EVT");
  assert.end();
});

test("TrainingComponent should render a training", (assert) => {
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);  
  eventbus.emit("TRAINING_LOAD_EVT", training);

  assert.equal(component.find("header.panel-header span").text(), "my training");
  assert.equal(component.find("SegmentComponent").length, 1);
  assert.equal(component.find("output[name='totals']").length, 1);
  assert.equal(component.find("menu").length, 1);
  const buttons = component.find("menu button");
  assert.equal(buttons.first().text(), "add empty segment");  
  assert.equal(buttons.at(1).text(), "export training");
  assert.equal(buttons.at(2).text(), "open save dialog");
  assert.equal(buttons.at(3).text(), "clear training");  
  assert.ok(buttons.at(3).hasClass("button-warning"));
  assert.equal(buttons.at(4).text(), "clone training");

  assert.end();
});

test("TrainingComponent should emit a TRAINING_CLONE_CMD", (assert) => {
  const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
  const emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);  
  component.find("menu button").at(4).simulate("click");
  assert.ok(emitSpy.calledWith("TRAINING_CLONE_CMD"), "component should emit TRAINING_CLONE_CMD");
  assert.end();
});

test("TrainingComponent should allow a toggle of trainingname as editable component", (assert) => {  
  const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
  const emitSpy = sinon.spy(eventbus, "emit");
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
  const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
  const emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  const BUTTON_SELECTOR = "button[id='edit-name-button']";
  const TEXTFIELD_SELECTOR = "input[id='edit-name-textfield']";
  eventbus.emit("TRAINING_LOAD_EVT", training);  
  component.find(BUTTON_SELECTOR).simulate("click");
  component.find(TEXTFIELD_SELECTOR).simulate("blur");
  assert.ok(emitSpy.calledWith("TRAINING_UPDATE_CMD"), "component should emit TRAINING_UPDATE_CMD");
  assert.end();
});
