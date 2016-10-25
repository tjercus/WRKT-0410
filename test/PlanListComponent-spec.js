import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import PlanListComponent from "../src/components/PlanListComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

const plans = [
  {"uuid": "2a63ef62-test-4b92-8971-59db6e58394c", "name" : "plan one"},
  {"uuid": "0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149", "name" : "plan two"}
];

test("Component should render", (assert) => {  
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<PlanListComponent eventbus={eventbus} />);

  eventbus.emit("PLANLIST_FETCH_EVT", plans);

  assert.equal(component.find('ul').children().length, 2);
  assert.end();
});