import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

import EventEmitter from "eventemitter4";

// Component under test
import AppComponent from "../src/components/AppComponent";

// TODO more DOM structure tests

test("AppComponent should render the right DOM structure", (assert) => {
  const eventbus = new EventEmitter( {wildcard: true, maxListeners: 99} );

  // block eventbus.emit since it cause a long setTimeout via NotificationComponent
  sinon.stub(eventbus, "emit", function() {});

  const component = mount(<AppComponent eventbus={eventbus} startWithDefaultTraining={false} />);
  //assert.equal(component.html(), "html");
  assert.equal(component.find("header[id='app-header']").length, 1);
  assert.equal(component.find("ul.menu").length, 1);
  const buttons = component.find("ul.menu button");
  assert.equal(buttons.at(0).text(), "Training");
  assert.equal(buttons.at(1).text(), "Plans");
  assert.equal(buttons.at(2).text(), "Timeline");
  assert.equal(buttons.at(3).text(), "Settings");
  assert.equal();
  assert.end();
});
