import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import MenuComponent from "../src/components/MenuComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

test("Component should render", (assert) => {  
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<MenuComponent eventbus={eventbus} />);
  assert.equal(component.find('ul').children().length, 4);
  assert.end();
});

test("Component should emit MENU_CLICK_EVT on button click", (assert) => {  
  const emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<MenuComponent eventbus={eventbus} />);
  const button = component.find("button[value='menu-item-timeline']");

  button.simulate("click");

  assert.ok(emitSpy.calledWith("MENU_CLICK_EVT"));
  assert.ok(button.hasClass("button-active"));
  assert.end();
});

