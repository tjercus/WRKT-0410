import makeDom from "../shell/dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";
import moment from "moment";

// Component Under Test
import DayEditComponent from "./DayEditComponent";
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

test("DayEditComponent should render", (assert) => {
  const component = mount(<DayEditComponent eventbus={eventbus} name="DayEditPanel" from="its-menu-item" />);

  assert.ok(component.find("section").hasClass("panel"));
  // assert.equal(component.html(), "blah");
  assert.end();
});

test("DayEditComponent should load a day via eventbus", (assert) => {
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
