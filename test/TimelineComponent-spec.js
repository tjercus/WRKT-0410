import makeDom from "./dom";
import test from "tape";
import React from "react";
import { shallow, mount } from "enzyme";
import sinon from "sinon";

// Component Under Test
import TimelineComponent from "../src/components/TimelineComponent";
// specific dependencies for CUT
import EventEmitter from "eventemitter2";

const eventbus = new EventEmitter({ wildcard: true, maxListeners: 99 });
const emitSpy = sinon.spy(eventbus, "emit");
const onSpy = sinon.spy(eventbus, "on");
let traininginstances = [
  {
    "uuid": "2a63ef62-test-4b92-8971-59db6e58394c",
    "name": "Easy run",
    "type": "easy",
    "segments": [
      {
        "uuid": "48",
        "distance": 6,
        "pace": "05:00",
        "duration": "00:30:00"
      }
    ],
    "total": {        
      "distance": 6,
      "pace": "05:00",
      "duration": "00:30:00"
    }    
  },
  {
    "uuid": "0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149",
    "name": "Really hard run",
    "type": "workout",
    "segments": [
      {
        "uuid": "4439-sdhf",
        "distance": 12,
        "pace": "04:00",
        "duration": "00:48:00"
      }
    ],    
    "total": {        
      "distance": 12,
      "pace": "04:00",
      "duration": "00:48:00"
    }
  }
];
let plans = [];
let plan = {
  "uuid": "acc3d1b8-test-4d70-dda3-d0e885f516f4",
  "name": "10k plan #1",
  "days": [
    {"uuid": "897435-sdfkjsd",
    	"trainings": [
    		{"instanceId": "2a63ef62-test-4b92-8971-59db6e58394c"},
    		{"instanceId": "0a705d04-6e7d-11e6-ba0f-7fcdd2cc0149"}
    	]
  	}
  ]
}
plan.days[0].trainings[0] = traininginstances[0];
plan.days[0].trainings[1] = traininginstances[1];
plans.push(plan);

test("TimelineComponent should render plan with multiple trainings per day in it", (assert) => {
  onSpy.reset();
  const component = mount(<TimelineComponent eventbus={eventbus} name="Timeline" from="menu-item-timeline" />);  
  eventbus.emit("PLAN_LOAD_EVT", plan);
  assert.ok(onSpy.calledWith("PLAN_LOAD_EVT"), "component should catch PLAN_LOAD_EVT");  
  assert.equal(component.find("section.day").length, 1, "one section for one day");
  assert.end();
});

