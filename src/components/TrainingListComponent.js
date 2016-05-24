import React from "react";
import EventEmitter from "eventemitter2";

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
    this.props.eventbus.on("MENU_CLICK_EVT", ((menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        this.setState({isVisible: false});
      }
    }));

    this.props.eventbus.on("TRAINING_LIST_EVT", ((trainings) => {
      this.setState({trainings: trainings});
    }));
    this.props.eventbus.emit("TRAINING_LIST_CMD");
  }

  onClick(evt) {
    evt.preventDefault();
    console.log("clicked on: " + evt.target.value);
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
