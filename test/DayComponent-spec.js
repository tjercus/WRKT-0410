import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";
import moment from "moment";

// Component Under Test
import DayComponent from "../src/components/DayComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter4";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });

const day = {
  uuid: "blah-123",
  trainings: [
    {
      uuid: "training-123",
      total: {
        distance: 1.0,
        duration: "00:05:00",
        pace: "05:00"
      }
    }
  ],
  dfd: moment()
}

test("DayComponent should render", (assert) => {
  const component = mount(<DayComponent eventbus={eventbus} day={day} dayNr={1} />);

  assert.ok(component.find('td').hasClass("day"));
  assert.end();
});

/*
test("Component should emit event on button press", (assert) => {
  //const onSpy = sinon.spy(eventbus, "on");
  let emitSpy = sinon.spy(eventbus, "emit");
  const component = mount(<DayComponent eventbus={eventbus} />);

  component.find('button').simulate('click');

  assert.ok(emitSpy.calledWith("PLAN_ADD_CMD"));
  assert.end();
});
*/
