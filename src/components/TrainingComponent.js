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
      total: {
        distance: 0,
        duration: "00:00:00",
        pace: "00:00"
      }
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
      this.clearTraining();
      console.log("TrainingComponent TRAINING_LOAD_EVT nr of segments " + training.segments.length + ", 0: " + JSON.stringify(training.segments[0]));
      this.setState({uuid: training.uuid, name: training.name, segments: training.segments, total: training.total});
    }));
    this.props.eventbus.on("SEGMENT_ADD_EVT", ((training) => {
      console.log("TrainingComponent after adding received " + JSON.stringify(training));
      this.setState({segments: training.segments, total: training.total});
    }));
    this.props.eventbus.on("SEGMENT_REMOVE_EVT", ((training) => {
      this.setState({segments: training.segments, total: training.total});
    }));
    this.props.eventbus.on("TRAINING_CLEAR_EVT", ((uuid) => {
      this.setState({
        isVisible: true,
        uuid: null,
        name: "",
        segments: [],
        total: {
          distance: 0,
          duration: "00:00:00",
          pace: "00:00"
        }
      });
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
    this.props.eventbus.emit("TRAINING_CLEAR_CMD", this.state.uuid);
  }
  
  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    let segmentComponents = [];
    console.log("TrainingComponent.render() starting with " + segmentComponents.length);
    console.log("TrainingComponent.render() segment 0: " + JSON.stringify(this.state.segments[0]));

    this.state.segments.forEach((segment, i) => {
      console.log("TrainingComponent: re-rendering segment, segment: " + JSON.stringify(segment));
      segmentComponents.push(<SegmentComponent key={i} eventbus={this.props.eventbus} segment={segment} />);
    });

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
              {segmentComponents}
            </tbody>
            </table>
            <output name="totals">
              <p>
                {"Total distance:"} <em>{(this.state.total.distance).toFixed(3)}</em> km,
                {"duration:"} <em>{this.state.total.duration}</em>,
                {"average pace:"} <em><time>{this.state.total.pace}</time></em>
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
