import makeDom from "../shell/dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import TrainingPanelComponent from "./TrainingPanelComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter4";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
const emitSpy = sinon.spy(eventbus, "emit");
const onSpy = sinon.spy(eventbus, "on");

test("TrainingPanelComponent should initially render with an info message", (assert) => {
  let eventbus = sinon.spy();
  const component = shallow(<TrainingPanelComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  assert.equal(component.find("div").text(), "Please choose a training from the left-hand list");
  assert.end();
});

test("TrainingComponent should catch a MENU_CLICK_EVT", (assert) => {
  onSpy.reset();
  const component = mount(<TrainingPanelComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("MENU_CLICK_EVT", "Training");
  assert.ok(onSpy.calledWith("MENU_CLICK_EVT"), "component should catch MENU_CLICK_EVT");
  assert.end();
});
