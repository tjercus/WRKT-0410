import React from "react";
import EventEmitter from "eventemitter2";
import {clone} from "../stores/miscUtil";

export default class PlanListComponent extends React.Component {

  constructor(props) {    
    super(props);
    this.state = {      
      isVisible: false,
      selectedUid: null,
      planlist: []
    };
    this.onClick = this.onClick.bind(this);
  }
  
  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      this.setState({ isVisible: (menuItemName === this.props.from) });
    });

    this.props.eventbus.on("PLANLIST_FETCHED_EVT", (planlist) => {
      this.setState({planlist: planlist});
    });

    this.props.eventbus.on("PLAN_LOAD_EVT", (uuid) => {
      this.setState({ isVisible: false });
    });
  }

  onClick(evt) {
    const uuid = evt.target.attributes[1].nodeValue;
    console.log(`PlanListComponent PLAN_FETCH_CMD uuid ${uuid}`);
    this.setState({selectedUid: uuid});
    this.props.eventbus.emit("PLAN_FETCH_CMD", uuid);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";    
    return (
      <section className={panelClassName}>       
        <div className="panel-body">
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
