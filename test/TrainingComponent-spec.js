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
  const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
  const segments = [{
    uuid: "uuid-segment1",
    distance: 5.1,
    duration: "01:23:45",
    pace: "03:59"
  }];
  const training = { uuid: "uuid-training1", name: "my training", segments: segments, total: { distance: 5.1, duration: "01:23:45", pace: "03:59" } };  
  const component = mount(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  
  eventbus.emit("TRAINING_LOAD_EVT", training);  

  assert.equal(component.find("header.panel-header").text(), "my training");
  assert.equal(component.find("SegmentComponent").length, 1);
  assert.equal(component.find("output[name='totals']").length, 1);
  assert.equal(component.find("menu").length, 1);
  const buttons = component.find("menu button");
  assert.equal(buttons.first().text(), "add empty segment");  
  assert.equal(buttons.at(1).text(), "export training");
  assert.equal(buttons.at(2).text(), "open save dialog");
  assert.equal(buttons.at(3).text(), "clear training");  
  assert.ok(buttons.at(3).hasClass("button-warning"));

  assert.end();
});
