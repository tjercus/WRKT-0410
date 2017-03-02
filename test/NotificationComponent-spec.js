import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import NotificationComponent from "../src/components/NotificationComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter4";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

test("NotificationComponent should render", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<NotificationComponent eventbus={eventbus} />);
  assert.equal(component.html(), '<div class="notification-panel"><ul></ul></div>');
  assert.end();
});

test("NotificationComponent should render an event as notification", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<NotificationComponent eventbus={eventbus} />);
  eventbus.emit("TRAINING_LOAD_EVT", {uuid: "123-abc"});
  assert.equal(component.html(), '<div class="notification-panel"><ul><li>Training \'123-abc\' is loaded in store</li></ul></div>');
  assert.end();
});

//eventbus.emit("MENU_CLICK_EVT", "Training");
  //assert.ok(onSpy.calledWith("MENU_CLICK_EVT"), "component should catch MENU_CLICK_EVT");
