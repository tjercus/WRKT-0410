import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import TrainingListComponent from "../src/components/TrainingListComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

const trainings = [
  {"uuid": "2a63ef62-test-4b92-8971-59db6e58394c", "name" : "training one"},
  {"uuid": "0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149", "name" : "training two"}
];

test("Component should render", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<TrainingListComponent eventbus={eventbus} />);

  eventbus.emit("TRAININGS_FETCH_EVT", trainings);

  assert.equal(component.find('ul').children().length, 2);
  assert.end();
});

test("Component should re-render if store updates list", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  const component = mount(<TrainingListComponent eventbus={eventbus} />);
  trainings.push({uuid: "34957", name: "third"});

  eventbus.emit("TRAININGS_UPDATE_EVT", trainings);

  assert.equal(component.find('ul').children().length, 3);
  assert.end();
});

/*
test("Component should emit TRAINING_LOAD_CMD on button click", (assert) => {  
  const emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<TrainingListComponent eventbus={eventbus} />);  
  eventbus.emit("TRAININGS_FETCH_EVT", trainings);
  const button = component.find("a[value='0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149']");

  assert.equals(button.html(), '<a href="#" value="0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149">training two</a>');

  // TODO find out why a linkclick does not work here
  button.simulate("click");

  //assert.ok(emitSpy.calledWith("TRAINING_LOAD_CMD"));
  assert.ok(button.hasClass("menu-item-selected"));
  assert.end();
});
*/
