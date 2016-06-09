
import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

import {clone} from "../stores/miscUtil";

const DAY_HEADER_DATE_FORMAT = "ddd, DD-MM-YYYY";

export default class TimelineComponent extends React.Component {
	
	constructor(props) {
    super(props);
    this.state = { 
    	isVisible: false,
      showEasyDays: true,
    	days: [],
    	cycleLength: 7
    };    
    this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onHideEasyRunsButtonClick = this.onHideEasyRunsButtonClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", ((menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        this.setState({isVisible: false});
      }
    }));
    this.props.eventbus.on("PLAN_LOAD_EVT", ((days) => {
    	this.setState({days: days});
    }));
    this.props.eventbus.emit("PLAN_LOAD_CMD");
  }

  // TODO extract method
  // TODO days from config
  isNonWorkday(aDay) {
  	return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  onCycleLengthButtonClick(evt) {  	
  	this.setState({cycleLength: evt.target.value});
  }

  onHideEasyRunsButtonClick(evt) {
    this.setState({showEasyDays: false});
  }

  onEditClick(evt) {
    let dayNr = evt.target.value;    
    this.props.eventbus.emit("MENU_CLICK_EVT", "menu-item-dayedit", dayNr);    
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    // TODO, from datepicker or other UI component
    let aDay = moment("2016-05-07");

    let lies = [];
    this.state.days.forEach((day, i) => {
			aDay.add(1, "days");
    	let dateStr = aDay.format(DAY_HEADER_DATE_FORMAT);
    	let sectionClassName = this.isNonWorkday(aDay) ? "day day-nowork" : "day day-work";
      if (this.state.showEasyDays === false && day.training.type === "easy") {
        console.log("hiding day as easy " + day.training.name);
        sectionClassName += " day-easy";
      }

    	if (i % this.state.cycleLength === 0) {    		
    		lies.push(<div key={"div" + i}>&nbsp;</div>);
    	}
    	// if (i % (this.state.cycleLength + 1) === 0) {
     //  	lies.push(<section key={"cycle" + i} className="day cycle-summary">Section summary</section>);
     //  }
     // TODO support multiple trainings per day
      lies.push(
       	<section key={i} className={sectionClassName}>
      		<h3>{day.nr}. {dateStr}</h3>
        	<p className="training-name">{day.training.name}, {(day.training.total.distance).toFixed(2)} km</p>
          <button className="button-small button-flat" onClick={this.onEditClick} value={day.nr}>edit</button>          
        </section>
      );
      
    });

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <button className="button-small" onClick={this.onCycleLengthButtonClick} value="7">{"7 day cycle"}</button>
          <button className="button-small" onClick={this.onCycleLengthButtonClick} value="9">{"9 day cycle"}</button>
          <button className="button-small" onClick={this.onHideEasyRunsButtonClick}>{"de-emphasize easy days"}</button>
        </header>
        <div className="panel-body">
           <div className="days-list">
            {lies}
           </div>
        </div>
      </section>
    );
  }

}