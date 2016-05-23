
import React from "react";
import EventEmitter from "eventemitter2";
import moment from "moment";

const DAY_HEADER_DATE_FORMAT = "ddd, DD-MM-YYYY";

export default class TimelineComponent extends React.Component {
	
	constructor(props) {
    super(props);
    this.state = { 
    	isVisible: false,
    	days: [],
    	cycleLength: 7
    };    
    this.onCycleLengthButtonClick = this.onCycleLengthButtonClick.bind(this);
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

  isNonWorkday(aDay) {
  	return (aDay.day() === 0 || aDay.day() === 3 || aDay.day() === 6);
  }

  onCycleLengthButtonClick(evt) {  	
  	this.setState({cycleLength: evt.target.value});
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
    	if (i % this.state.cycleLength === 0) {    		
    		lies.push(<div key={"div" + i}>&nbsp;</div>);
    	}
    	// if (i % (this.state.cycleLength + 1) === 0) {
     //  	lies.push(<section key={"cycle" + i} className="day cycle-summary">Section summary</section>);
     //  }
      lies.push(
       	<section key={i} className={sectionClassName}>
      		<h3>{day.nr}. {dateStr}</h3>
        	<p className="workout-name">{day.workout.name}</p>
          <p className="workout-distance">Distance: {(day.workout.total.distance).toFixed(2)} km</p>
        </section>
      );      
      
    });

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <button className="button-small" onClick={this.onCycleLengthButtonClick} value="7">7 day cycle</button>
          <button className="button-small" onClick={this.onCycleLengthButtonClick} value="9">9 day cycle</button>
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