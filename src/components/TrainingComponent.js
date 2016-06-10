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
    this.emitClearTraining = this.emitClearTraining.bind(this);
    this.clearTrainingFromLocalState = this.clearTrainingFromLocalState.bind(this);
    this.addEmptySegment = this.addEmptySegment.bind(this);
    this.loadTraining = this.loadTraining.bind(this);
  }
  
  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({isVisible: true});
      } else {
        this.setState({isVisible: false});
      }
    });
    this.props.eventbus.on("TRAINING_LOAD_EVT", (training) => {
      this.loadTraining(training);
    });
    this.props.eventbus.on("SEGMENT_ADD_EVT", (training) => {
      this.setState({segments: training.segments, total: training.total});      
    });
    this.props.eventbus.on("SEGMENT_REMOVE_EVT", (training) => {   
      this.setState({segments: training.segments, total: training.total}, function() {
        //console.log("TrainingComponent finished updating state with new segments");
      });
    });
    this.props.eventbus.on("TRAINING_CLEAR_EVT", (uuid) => {
      this.clearTrainingFromLocalState();
    });
    this.props.eventbus.on("SEGMENT_UPDATE_EVT", (segment) => {      
      //console.log("TrainingComponent: caught SEGMENT_UPDATE_EVT");      
      this.setState({total: segment.total}, function() {
        console.log("TrainingComponent finished updating state with total");
      });
    });
  }

  loadTraining(training) {
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
      }, 
      function() {
        this.setState({
          uuid: training.uuid,
          name: training.name,
          segments: training.segments,
          total: training.total
        });
      });
    // TODO get this working
    // this.clearTrainingFromLocalState(function(training) {      
    //   console.log("TrainingComponent.loadTraining clearTrainingFromLocalState cb: " + training.uuid);
    //   this.setState({uuid: training.uuid, name: training.name, segments: training.segments, total: training.total});
    // }.bind(this));
  }

  addEmptySegment() {
    this.props.eventbus.emit("SEGMENT_ADD_CMD", {});
  }

  openSaveDialog() {}

  exportTraining() {
    console.log(JSON.stringify({uuid: this.state.uuid, name: this.state.name, segments: this.state.segments}));    
  }
  
  emitClearTraining() {
    this.props.eventbus.emit("TRAINING_CLEAR_CMD", this.state.uuid);
  }

  clearTrainingFromLocalState() {    
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
  }
  
  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";
    let segmentComponents = [];

    this.state.segments.forEach((segment, i) => {
      segmentComponents.push(<SegmentComponent key={i} eventbus={this.props.eventbus} segment={segment} />);
    });

    let totalDistance = 0;
    if (this.state.total && this.state.total.distance) { 
      totalDistance = (this.state.total.distance).toFixed(3);
    };

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
                {"Total distance:"} <em>{totalDistance}</em> km,
                {"duration:"} <em>{this.state.total.duration}</em>,
                {"average pace:"} <em><time>{this.state.total.pace}</time></em>
              </p>
              <p>UUID: {this.state.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">add empty segment</button>
              <button onClick={this.exportTraining} className="button-flat">export training</button>
              <button onClick={this.openSaveDialog} className="button-flat">open save dialog</button>
              <button onClick={this.emitClearTraining} className="button-flat button-warning">clear training</button>
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
