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
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        this.setState({isVisible: false});
      }
    });

    this.props.eventbus.on("PLANLIST_FETCHED_EVT", (planlist) => {
      this.setState({planlist: planlist});
    });
  }

  onClick(evt) {
    console.log("uuid " + evt.target.attributes[1].nodeValue);
    this.props.eventbus.emit("PLAN_FETCH_CMD", evt.target.attributes[1].nodeValue);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";    
    return (
      <section className={panelClassName}>       
        <div className="panel-body">
           <ul>
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
