import React from "react";
import SegmentComponent from "./SegmentComponent";
import { clone } from "../stores/miscUtil";

export default class TrainingComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      uuid: null,
      name: "undefined",
      type: null,
      segments: [],
      isNameEditable: false,      
      total: {
        distance: 0,
        duration: "00:00:00",
        pace: "00:00"
      }
    };
    this.exportTraining = this.exportTraining.bind(this);
    this.emitClearTraining = this.emitClearTraining.bind(this);
    this.emitPersistChanges = this.emitPersistChanges.bind(this);
    this.clearTrainingFromLocalState = this.clearTrainingFromLocalState.bind(this);
    this.addEmptySegment = this.addEmptySegment.bind(this);
    this.loadTraining = this.loadTraining.bind(this);
    this.cloneTraining = this.cloneTraining.bind(this);
    this.onEditNameButtonClick = this.onEditNameButtonClick.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onNameBlur = this.onNameBlur.bind(this);
    this.onTypeClick = this.onTypeClick.bind(this);
  }

  componentDidMount() {
    this.props.eventbus.on("MENU_CLICK_EVT", (menuItemName) => {
      if (menuItemName === this.props.from) {
        this.setState({ isVisible: true });
      } else {
        this.setState({ isVisible: false });
      }
    });

    this.props.eventbus.on("TRAINING_LOAD_EVT", (training) => {
      this.loadTraining(training);
    });
    // this.props.eventbus.on("TRAINING_UPDATE_EVT", (training) => {
    //   this.loadTraining(training);
    // });

    this.props.eventbus.on("SEGMENT_ADD_EVT", (training) => {
      this.setState({ segments: training.segments, total: training.total });
    });
    // TODO find out why this is never caught:    
    // this.props.eventbus.on("SEGMENT_UPDATE_EVT", (data) => {});
    this.props.eventbus.onAny((event, data) => {      
      if (event === "SEGMENT_UPDATE_EVT") {
        this.setState({ total: data.total });
      }
    });    
    this.props.eventbus.on("SEGMENT_REMOVE_EVT", (training) => {
      this.setState({ segments: [], total: {} }, function() {
        console.log("TrainingComponent emptied segments");
        this.setState({ segments: training.segments, total: training.total }, function() {
          console.log("TrainingComponent finished updating state with new segments");
        });
      });
    });
    this.props.eventbus.on("TRAINING_CLEAR_EVT", (uuid) => {
      this.clearTrainingFromLocalState();
    });    
  }

  loadTraining(training) {
    this.setState({
        isVisible: true,
        uuid: null,
        name: "undefined",
        type: null,
        segments: [],
        isNameEditable: false,
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
          type: training.type,
          segments: training.segments,
          total: training.total
        });
      });
    // TODO get this working
    // this.clearTrainingFromLocalState(function(training) {      
    //   this.setState({uuid: training.uuid, name: training.name, segments: training.segments, total: training.total});
    // }.bind(this));
  }

  addEmptySegment() {
    this.props.eventbus.emit("SEGMENT_ADD_CMD", {});
  }

  emitPersistChanges() {
    this.props.eventbus.emit("TRAININGS_PERSIST_CMD");
  }

  exportTraining() {
    console.log(JSON.stringify({ uuid: this.state.uuid, name: this.state.name, segments: this.state.segments }));
  }

  emitClearTraining() {
    this.props.eventbus.emit("TRAINING_CLEAR_CMD", this.state.uuid);
  }

  onEditNameButtonClick(evt) {
    //const inverseState = 
    this.setState({ isNameEditable: !this.state.isNameEditable });
  }

  onNameChange(evt) {
    this.setState({ name: evt.target.value });
  }

  onNameBlur(evt) {
    console.log(`onNameBlur ${this.state.name}`);
    this.props.eventbus.emit("TRAINING_UPDATE_CMD", this.state);
  }

  cloneTraining() {
    // TODO custom alert    
    console.log("Training cloned and selected");
    this.props.eventbus.emit("TRAINING_CLONE_CMD");
    alert("Training cloned and selected");
  }

  clearTrainingFromLocalState() {
    this.setState({
      isVisible: true,
      uuid: null,
      name: "undefined",
      type: null,
      segments: [],
      isNameEditable: false,
      total: {
        distance: 0,
        duration: "00:00:00",
        pace: "00:00"
      }
    });
  }

  onTypeClick(evt) {
    console.log(`onTypeClick: ${evt.target.value}`); 
    console.log(`state: ${this.state.name}`);
    this.setState({type: evt.target.value }, () => {
      // create training object from state
      const training = {
        uuid: this.uuid,
        name: this.name,
        type: this.type,
        segments: this.segments
      }
      this.props.eventbus.emit("TRAINING_UPDATE_CMD", training); // TODO test: 'should emit event when button clicked'
    });
    
  }

  render() {
    let panelClassName = this.state.isVisible ? "panel visible" : "panel hidden";

    let nameComponent = "";
    if (this.state.isNameEditable) {
      nameComponent = <input type="text" id="edit-name-textfield" name="edit-name-textfield" value={this.state.name} onChange={this.onNameChange} onBlur={this.onNameBlur} />
    } else {
      nameComponent = <span id="name-label">{this.state.name}</span>;
    }

    let segmentComponents = [];
    this.state.segments.forEach((segment, i) => {
      segmentComponents.push(<SegmentComponent key={i} eventbus={this.props.eventbus} segment={segment} />);
    });

    let totalDistance = 0;
    if (this.state.total && this.state.total.distance) {
      totalDistance = (this.state.total.distance).toFixed(3);
    };

    // TODO refactor to ButtonChoiceComponent    
    const type1ButtonClassName = (this.state.type === "workout") ? "button-choice button-choice-selected" : "button-choice";
    const type2ButtonClassName = (this.state.type === "easy") ? "button-choice button-choice-selected" : "button-choice";

    if (this.state.uuid) {
      return (
        <section className={panelClassName}>
          <header className="panel-header">
            {nameComponent}
            <button id="edit-name-button" onClick={this.onEditNameButtonClick} className="button-small button-flat">{"edit"}</button>
          </header>
          <div className="panel-body">
            <fieldset name="type">
              Type of training &nbsp;
              <button onClick={this.onTypeClick} value="workout" className={type1ButtonClassName}>{"workout"}</button>
              <button onClick={this.onTypeClick} value="easy" className={type2ButtonClassName}>{"easy run"}</button>
            </fieldset>
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
                {"Total distance:"} <em>{totalDistance}</em> {"km, "}
                {"duration:"} <em>{this.state.total.duration}</em> {", "}
                {"average pace:"} <em><time>{this.state.total.pace}</time></em>
              </p>
              <p>UUID: {this.state.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">add empty segment</button>
              <button onClick={this.exportTraining} className="button-flat">export training</button>
              <button onClick={this.emitPersistChanges} className="button-flat" id="persist-button">persist changes</button>
              <button onClick={this.emitClearTraining} className="button-flat button-warning">clear training</button>
              <button onClick={this.cloneTraining} className="button-flat">clone training</button>
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
