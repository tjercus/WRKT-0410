
import React from "react";
import { createRenderer } from "react-addons-test-utils";
import createComponent from "react-unit";
import tape from "tape";
import addAssertions from "extend-tape";
import jsxEquals from "tape-jsx-equals";
import sinon from "sinon";
const test = addAssertions(tape, {jsxEquals});

// Component Under Test
import TrainingComponent from "../src/components/TrainingComponent";
import {events} from "../src/components/constants";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const renderedComponent = 
`<section className="panel hidden">
  <header className="panel-header">
     
  </header>
  <div className="panel-body">
    Please choose a training from the left-hand list
  </div>
</section>`;

test("TrainingComponent should render the right DOM structure", (assert) => {
  let eventbus = sinon.spy();
  const renderer = createRenderer();
  renderer.render(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  const result = renderer.getRenderOutput();
  assert.jsxEquals(result, renderedComponent);
  assert.end();
});

//test("TrainingComponent should be visible after a MENU_CLICK_EVT containing it's name", (assert) => {
//  // TODO implement
//});

/*
// TODO fix
test("TrainingComponent should render a training", (assert) => {
  //const eventbus = sinon.stub(eventbus, "on", onStub);
  //eventbus.on
  const eventbus = new EventEmitter({wildcard: true, maxListeners: 4});
  const segments = [{
    uuid: "uuid-segment1",
    distance: 5.1,
    duration: "01:23:45",
    pace: "03:59"
  }];  
  const training = {uuid: "uuid-training1", name: "my training", segments: segments, total: {distance: 5.1, duration: "01:23:45", pace: "03:59"}};
  const renderer = createRenderer();
  
  renderer.render(<TrainingComponent eventbus={eventbus} name="Training" from="menu-item-training" />);
  eventbus.emit("TRAINING_LOAD_EVT", training);

  setTimeout(function() {
    const result = renderer.getRenderOutput();
    assert.ok(result.contains("Easy run"));
    assert.end();
  }, 5000);  
});
*/