import React from "react";
import EventEmitter from "eventemitter2";
import {EventsEnum as ee} from "../constants";
import PlanEditComponent from "./PlanEditComponent";

export default class PlanListComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      selectedUid: null,
      planlist: [],
      newPlanName: "new plan",
    };
    this.onClick = this.onClick.bind(this);   
  }

  componentDidMount() {
    this.props.eventbus.on(ee.MENU_CLICK_EVT, (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on(ee.PLANLIST_FETCH_EVT, (planlist) => {
      this.setState({planlist: planlist});
    });

    this.props.eventbus.on(ee.PLAN_LOAD_EVT, (plan) => {
      this.setState({ isVisible: false });
      this.props.eventbus.emit(ee.MENU_CLICK_EVT, "menu-item-timeline");
    });

    this.props.eventbus.on(ee.PLAN_ADD_EVT, () => {
      this.props.eventbus.emit(ee.PLANLIST_FETCH_CMD);
    });
  }

  onClick(evt) {
    const uuid = evt.target.attributes[1].nodeValue;
    this.setState({selectedUid: uuid});
    this.props.eventbus.emit(ee.PLAN_FETCH_CMD, uuid);
  } 

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    return (
      <section className={panelClassName}>
        <div className="panel-body">
          <PlanEditComponent eventbus={this.props.eventbus} />
          <h2>{"Available plans"}</h2>
          <ul className="selection-list">
            {this.state.planlist.map(function(plan, i) {
              let itemClassName = (this.state.selectedUid === plan.uuid) ? "menu-item-selected" : "";
              return <li key={i} className={itemClassName}>
                <a href="#" onClick={this.onClick} value={plan.uuid}>{plan.name}</a>
              </li>;
            }.bind(this))}
          </ul>
        </div>
      </section>
    );
  }
}

PlanListComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
}
