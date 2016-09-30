import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import PlanEditComponent from "../src/components/PlanEditComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

const plans = [
  {"uuid": "2a63ef62-test-4b92-8971-59db6e58394c", "name" : "plan one"},
  {"uuid": "0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149", "name" : "plan two"}
];

test("Component should render", (assert) => {  
  const component = mount(<PlanEditComponent eventbus={eventbus} />);  

  assert.equal(component.state("newPlanName"), "new plan", "the name field should have a default value");
  assert.ok(component.find('input').hasClass("type-text"));
  assert.ok(component.find('button').hasClass("button-small"));
  assert.end();
});

test("Component should emit event on button press", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  let emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<PlanEditComponent eventbus={eventbus} />);

  component.find('button').simulate('click');

  assert.equal(component.state("newPlanName"), "", "after adding the name field should be cleared");
  assert.ok(emitSpy.calledWith("PLAN_ADD_CMD"));
  assert.end();
});