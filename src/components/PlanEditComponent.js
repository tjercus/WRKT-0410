import React from "react";
import EventEmitter from "eventemitter4";
import {EventsEnum as ee} from "../constants";

import { createUuid } from "../stores/objectUtil";

export default class PlanEditComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      newPlanName: "new plan",
      startDate: "2016-01-01"
    };

    this.onChange = this.onChange.bind(this);
    this.onAddPlanButtonClick = this.onAddPlanButtonClick.bind(this);
  }

  onChange(evt) {
    this.setState({newPlanName: evt.target.value});
  }

  onAddPlanButtonClick(evt) {
    this.setState({newPlanName: ""});
    this.props.eventbus.emit(ee.PLAN_ADD_CMD,
      {uuid: createUuid(), name: this.state.newPlanName, days: [], startDate: this.state.startDate}
    );
  }

  render() {
    return (
      <div>
        <h2>{"A new plan"}</h2>
        <input type="text" name="plan-name"
               value={this.state.newPlanName} onChange={this.onChange} className="type-text" />
        <button className="button-small" onClick={this.onAddPlanButtonClick}>{"add plan"}</button>
      </div>
    );
  }
}

PlanEditComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
};
