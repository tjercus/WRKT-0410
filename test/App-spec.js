
import React from "react";
import { createRenderer } from "react-addons-test-utils";
import createComponent from "react-unit";
import tape from "tape";
import addAssertions from "extend-tape";
import jsxEquals from "tape-jsx-equals";
const test = addAssertions(tape, {jsxEquals});

// Component under test
import AppComponent from "../src/components/AppComponent";

// TODO es6 multiline string
const renderedComponent = '<div>\n  <header id="app-header">\n    <h1>\n      Trainingplanner 1.0.0\n    </h1>\n    <MenuComponent eventbus={[object Object]} />\n  </header>\n  <article id="container">\n    <aside id="container-aside">\n      <TrainingListComponent\n        eventbus={[object Object]}\n        from="menu-item-training"\n        name="Traininglist"\n      />\n    </aside>\n    <main>\n      <TrainingComponent\n        eventbus={[object Object]}\n        from="menu-item-training"\n        name="Training"\n      />\n      <TimelineComponent\n        eventbus={[object Object]}\n        from="menu-item-timeline"\n        name="Timeline"\n      />\n      <PanelComponent\n        eventbus={[object Object]}\n        from="menu-item-settings"\n        name="Settings"\n      />\n    </main>\n  </article>\n</div>';

test("AppComponent should render the right DOM structure", (assert) => {  
  const renderer = createRenderer();
  renderer.render(<AppComponent />);
  const result = renderer.getRenderOutput();
  assert.jsxEquals(result, renderedComponent);
  assert.end();
});