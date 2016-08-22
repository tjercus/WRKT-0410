import React from "react";
import EventEmitter from "eventemitter2";
import {clone} from "../stores/miscUtil";

export default class TrainingListComponent extends React.Component {

  constructor(props) {    
    super(props);
    this.state = {      
      isVisible: false,
      selectedUid: null,
      trainings: []
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

    this.props.eventbus.on("TRAININGS_FETCHED_EVT", (trainings) => {
      this.setState({trainings: trainings});
    });

    this.props.eventbus.on("TRAINING_LIST_EVT", (trainings) => {
      if (trainings === undefined || trainings === null) {
        throw new Error("TRAINING_LIST_EVT was caught without a list of trainings");
      }      
      this.setState({trainings: trainings});
    });

    this.props.eventbus.on("TRAINING_LOAD_EVT", (training) => {
      this.setState({selectedUid: training.uuid});
    });

    this.props.eventbus.on("TRAINING_UPDATE_EVT", (obj) => {
      this.setState({trainings: obj.trainings});      
    });

    // handle TRAINING_ADD_EVT thrown by TrainingStore ??
    this.props.eventbus.emit("TRAINING_LIST_CMD");
  }  

  onClick(evt) {
    evt.preventDefault();
    this.setState({selectedUid: evt.target.value});
    this.props.eventbus.emit("TRAINING_LOAD_CMD", evt.target.value);
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";    
    return (
      <section className={panelClassName}>       
        <div className="panel-body">
           <ul>
            {this.state.trainings.map(function(training, i) {
              let itemClassName = (this.state.selectedUid === training.uuid) ? "menu-item-selected" : "";
              return <li key={i} className={itemClassName}><a href="#" onClick={this.onClick} value={training.uuid}>{training.name}</a></li>;
            }.bind(this))}
           </ul>
        </div>
      </section>
    );
  }
};
