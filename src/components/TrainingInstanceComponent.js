import React from "react";
import EventEmitter from "eventemitter2";
import SegmentComponent from "./SegmentComponent";
import {EventsEnum as ee, TRAINING_SHAPE} from "../constants";
import {makeTrainingTotal} from "../stores/segmentUtil";
import {clone, createUuid} from "../stores/miscUtil";

const DEFAULT_TOTAL = {
  distance: 0,
  duration: "00:00:00",
  pace: "00:00"
};

const DEFAULT_STATE = {
  uuid: null,
  name: "undefined",
  type: null,
  segments: [],
  isNameEditable: false,
  total: DEFAULT_TOTAL
};

/**
* Is used in DayEditComponent to display segments and totals for an instance
*/
export default class TrainingInstanceComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE;
    this.loadTraining(this.props.training);
    this.exportTraining = this.exportTraining.bind(this);
    this.emitClearTraining = this.emitClearTraining.bind(this);
    //this.clearTrainingFromLocalState = this.clearTrainingFromLocalState.bind(this);
    this.addEmptySegment = this.addEmptySegment.bind(this);
    //this.loadTraining = this.loadTraining.bind(this);
    this.removeTraining = this.removeTraining.bind(this);
    this.onEditNameButtonClick = this.onEditNameButtonClick.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onNameBlur = this.onNameBlur.bind(this);
    this.onTrainingTypeClick = this.onTrainingTypeClick.bind(this);
  }

  componentDidMount() {
    // Coarse-grained segment handling
    this.props.eventbus.on(ee.SEGMENTS_UPDATE_EVT, (training) => {
      console.log(`TrainingInstanceComponent received SEGMENTS_UPDATE_EVT with ${training.uuid} versus ${this.state.uuid}`);
      console.log(`TrainingInstanceComponent received: ${JSON.stringify(training)}`);
      if (training.uuid === this.state.uuid) {
        this.setState({
          segments: training.segments,
          total: training.total,
        });
      }
    });

    this.props.eventbus.on(ee.INSTANCE_CLEAR_EVT, (uuid) => {
      this.setState({
        segments: [],
        total: DEFAULT_TOTAL,
      });
    });

    this.props.eventbus.emit(ee.INSTANCE_LOAD_EVT, this.props.training);
  }

  loadTraining(training) {
    this.setState(DEFAULT_STATE, () => this.setState(this.makeTraining(training)));
  }

  addEmptySegment() {
    let _segments = clone(this.state.segments);
    _segments.push({uuid: createUuid(), trainingUuid: this.state.uuid});
    this.setState({
      segments: _segments,
      total: makeTrainingTotal(_segments),
    });
    // this.props.eventbus.emit(ee.INSTANCE_SEGMENT_ADD_CMD, {trainingUuid: this.props.training.uuid});
  }

  exportTraining() {
    console.log(JSON.stringify(this.props.training));
  }

  emitClearTraining() {
    this.props.eventbus.emit(ee.INSTANCE_CLEAR_CMD, this.state.uuid);
  }

  onEditNameButtonClick(evt) {
    this.setState({
      isNameEditable: !this.state.isNameEditable
    });
  }

  onNameChange(evt) {
    this.setState({ name: evt.target.value });
  }

  onNameBlur(evt) {
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.makeTraining(this.state));
  }

  removeTraining() {
    this.props.eventbus.emit(ee.INSTANCE_REMOVE_CMD);
  }

  onTrainingTypeClick(evt) {
    this.setState({type: evt.target.value});
    this.props.eventbus.emit(ee.INSTANCE_UPDATE_CMD, this.makeTraining(this.state));
    // TODO test: 'should emit event when button clicked'
  }

  /**
   * Create training object by selectively copying properties from another obj
   * @param  {Object} obj - training-like object
   * @returns {Training} training
   */
  makeTraining(obj) {
    return {
      uuid: obj.uuid,
      name: obj.name,
      type: obj.type,
      segments: obj.segments,
      total: obj.total
    }
  }

  render() {
    let panelClassName = "panel";

    console.log(`TrainingInstanceComponent rendered with ${this.state.uuid}`);

    let nameComponent = "";
    if (this.state.isNameEditable) {
      nameComponent = <input type="text" id="edit-name-textfield"
                        name="edit-name-textfield" value={this.state.name}
                        onChange={this.onNameChange} onBlur={this.onNameBlur}/>
    } else {
      nameComponent = <span id="name-label">{this.state.name}</span>;
    }

    let segmentComponents = this.state.segments.map((segment, i) => {
      return (<SegmentComponent key={i} eventbus={this.props.eventbus}
                segment={segment} trainingUuid={this.state.uuid}/>);
    });

    let totalDistance = 0;
    if (this.state.total && this.state.total.distance) {
      totalDistance = (this.state.total.distance).toFixed(3);
    }

    // TODO refactor to ButtonChoiceComponent
    const type1ButtonClassName = (this.state.type === "workout") ? "button-choice button-choice-selected" : "button-choice";
    const type2ButtonClassName = (this.state.type === "easy") ? "button-choice button-choice-selected" : "button-choice";

    return (
      <section className={panelClassName}>
        <header className="panel-header">
          {nameComponent}
          <button id="edit-name-button" onClick={this.onEditNameButtonClick}
                  className="button-small button-flat">{"edit"}</button>
        </header>
        <div className="panel-body">
          <fieldset name="type">
            Type of training &nbsp;
            <button onClick={this.onTrainingTypeClick} value="workout"
                    className={type1ButtonClassName}>{"workout"}</button>
            <button onClick={this.onTrainingTypeClick} value="easy"
                    className={type2ButtonClassName}>{"easy run"}</button>
          </fieldset>
          <table summary="training segments">
            <thead>
            <tr>
              <th>Distance</th>
              <th>Duration</th>
              <th>Pace</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {segmentComponents}
            </tbody>
          </table>
          <output name="totals">
            <p>
              {"Total distance:"} <em>{totalDistance}</em> {"km, "}
              {"duration:"} <em>{this.state.total.duration}</em> {", "}
              {"average pace:"} <em>
              <time>{this.state.total.pace}</time>
            </em>
            </p>
            <p>UUID: {this.state.uuid}</p>
          </output>
          <menu>
            <button onClick={this.addEmptySegment} className="button-flat">add empty segment
            </button>
          </menu>
          <menu>
            <button onClick={this.exportTraining} className="button-flat">export training</button>
            <button onClick={this.emitClearTraining} className="button-flat button-warning">clear
              training
            </button>
            <button onClick={this.removeTraining} className="button-flat">remove training</button>
          </menu>
        </div>
      </section>
    );
  };
}

TrainingInstanceComponent.propTypes = {
  eventbus: React.PropTypes.instanceOf(EventEmitter).isRequired,
  training: React.PropTypes.shape(TRAINING_SHAPE).isRequired,
};
