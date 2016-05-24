import React from "react";
import SegmentComponent from "./SegmentComponent";

export default class TrainingComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      uuid: null,
      name: "",
      segments: [],
      total: {distance: 0.0}
    };
    this.exportTraining = this.exportTraining.bind(this);
    this.clearTraining = this.clearTraining.bind(this);
    this.addEmptySegment = this.addEmptySegment.bind(this);
  }
  
  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", ((menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        this.setState({isVisible: false});
      }
    }));
    this.props.eventbus.on("TRAINING_LOAD_EVT", ((training) => {      
      this.setState({uuid: training.uuid, name: training.name, segments: training.segments, total: training.total});
    }));
    this.props.eventbus.on("SEGMENT_ADD_EVT", ((training) => {
      console.log("TrainingComponent after adding received " + JSON.stringify(training));
      this.setState({segments: training.segments, total: training.total});
    }));
    this.props.eventbus.on("SEGMENT_REMOVE_EVT", ((training) => {
      this.setState({segments: training.segments, total: training.total});
    }));
  }

  addEmptySegment() {
    this.props.eventbus.emit("SEGMENT_ADD_CMD", {});
  }

  openSaveDialog() {}

  exportTraining() {
    console.log(JSON.stringify({uuid: this.state.uuid, name: this.state.name, segments: this.state.segments}));    
  }
  
  clearTraining() {
    this.setState({
      isVisible: true,
      uuid: null,
      name: "",
      segments: [],
      total: {distance: 0.0}
    });

  }
  
  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    if (this.state.uuid) {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {this.state.name}            
          </header>
          <div className="panel-body">
            <table summary="training segments">
            <thead>
              <tr><th>Distance</th><th>Duration</th><th>Pace</th><th>Actions</th></tr>
            </thead>
            <tbody>

            {this.state.segments.map(function(segment, i) {
              return <SegmentComponent key={i} eventbus={this.props.eventbus} segment={segment} />;
            }.bind(this))}

            </tbody>
            </table>
            <output name="totals">
              <p>
                Total distance: <em>{(this.state.total.distance).toFixed(3)}</em> km,
                duration: <em>{this.state.total.duration}</em>,
                average pace: <em><time>{this.state.total.pace}</time></em>
              </p>
              <p>UUID: {this.state.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">add empty segment</button>
              <button onClick={this.exportTraining} className="button-flat">export training</button>
              <button onClick={this.openSaveDialog} className="button-flat">open save dialog</button>
              <button onClick={this.clearTraining} className="button-flat button-warning">clear training</button>
            </menu>            
          </div>        
        </section>
      );
    } else {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {this.state.name} {this.state.uuid}
          </header>
          <div className="panel-body">
            {"Please choose a training from the left-hand list"}
          </div>
        </section>
      );
    }
  }
};
