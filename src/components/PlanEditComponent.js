
import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import { clone, createUuid } from "../stores/miscUtil";

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
    this.props.eventbus.emit("PLAN_ADD_CMD", {uuid: createUuid(), name: this.state.newPlanName, days: [], startDate: this.state.startDate});
  }

  render() {
    return (
      <div>
        <h2>{"A new plan"}</h2>
        <input type="text" name="plan-name" value={this.state.newPlanName} onChange={this.onChange} className="type-text" />
        <button className="button-small" onClick={this.onAddPlanButtonClick}>{"add plan"}</button>
      </div>
    );
  }
}
