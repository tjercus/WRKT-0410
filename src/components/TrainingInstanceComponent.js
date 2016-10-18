import React from "react";
import SegmentComponent from "./SegmentComponent";
import {
  clone
} from "../stores/miscUtil";

const DEFAULT_STATE = {
  isNameEditable: false,
}

const DEFAULT_TOTAL = {
  distance: 0,
  duration: "00:00:00",
  pace: "00:00",
}

export default class TrainingInstanceComponent extends React.Component {

    constructor(props) {
      super(props);
      this.state = DEFAULT_STATE;
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
      // NOTE traininginstance is now loaded via props
      // this.props.eventbus.on("INSTANCE_LOAD_EVT", (training) => {
      //   console.log(`TrainingInstanceComponent received INSTANCE_LOAD_EVT with ${training.uuid}`);
      //   this.loadTraining(training);
      // });
      // this.props.eventbus.on("INSTANCE_UPDATE_EVT", (training) => {
      //   this.loadTraining(training);
      // });
      //

      // TODO do not use state but use this.props.training

      this.props.eventbus.on("INSTANCE_SEGMENT_ADD_EVT", (training) => {
        this.props.training.segments = training.segments;
        this.props.training.total = training.total;
        // TODO force re-render?
      });

      this.props.eventbus.on("INSTANCE_SEGMENT_REMOVE_EVT", (training) => {
        // TODO force re-render?
      });
      this.props.eventbus.on("INSTANCE_CLEAR_EVT", (uuid) => {
        this.props.training.segments = [];
        this.props.training.total = DEFAULT_TOTAL;
      });

      this.props.eventbus.emit("INSTANCE_LOAD_EVT", this.props.training);
    }

    // loadTraining(training) {
    //   this.setState(DEFAULT_STATE, () => this.setState(this.makeTraining(training)));
    // }

    addEmptySegment() {
      this.props.eventbus.emit("INSTANCE_SEGMENT_ADD_CMD", {});
    }

    exportTraining() {
      console.log(JSON.stringify(this.props.training));
    }

    emitClearTraining() {
      this.props.eventbus.emit("INSTANCE_CLEAR_CMD", this.props.training.uuid);
    }

    onEditNameButtonClick(evt) {
      //const inverseState =
      this.setState({
        isNameEditable: !this.state.isNameEditable
      });
    }

    onNameChange(evt) {
      this.props.training.name = evt.target.value;
    }

    onNameBlur(evt) {
      this.props.eventbus.emit("INSTANCE_UPDATE_CMD", this.props.training);
    }

    removeTraining() {
      this.props.eventbus.emit("INSTANCE_REMOVE_CMD");
    }

    onTrainingTypeClick(evt) {
      this.props.training.type = evt.target.value
      this.props.eventbus.emit("INSTANCE_UPDATE_CMD", this.props.training);
      // TODO test: 'should emit event when button clicked'
    }

    render() {
      let panelClassName = "panel";

      let nameComponent = "";
      if (this.state.isNameEditable) {
        nameComponent = <input type="text" id="edit-name-textfield"
          name="edit-name-textfield" value={this.props.training.name} onChange={this.onNameChange} onBlur={this.onNameBlur} />
      } else {
        nameComponent = <span id="name-label">{this.props.training.name}</span>;
      }

      let segmentComponents = [];
      this.props.training.segments.forEach((segment, i) => {
        segmentComponents.push(<SegmentComponent key={i} eventbus={this.props.eventbus} segment={segment} trainingUuid={this.props.training.uuid} />);
      });

        let totalDistance = 0;
        if (this.props.training.total && this.props.training.total.distance) {
          totalDistance = (this.props.training.total.distance).toFixed(3);
        };

        // TODO refactor to ButtonChoiceComponent
        const type1ButtonClassName = (this.props.training.type === "workout") ? "button-choice button-choice-selected" : "button-choice";
        const type2ButtonClassName = (this.props.training.type === "easy") ? "button-choice button-choice-selected" : "button-choice";

        return (
        <section className={panelClassName}>
          <header className="panel-header">
            {nameComponent}
            <button id="edit-name-button" onClick={this.onEditNameButtonClick} className="button-small button-flat">{"edit"}</button>
          </header>
          <div className="panel-body">
            <fieldset name="type">
              Type of training &nbsp;
              <button onClick={this.onTrainingTypeClick} value="workout" className={type1ButtonClassName}>{"workout"}</button>
              <button onClick={this.onTrainingTypeClick} value="easy" className={type2ButtonClassName}>{"easy run"}</button>
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
                {"duration:"} <em>{this.props.training.total.duration}</em> {", "}
                {"average pace:"} <em><time>{this.props.training.total.pace}</time></em>
              </p>
              <p>UUID: {this.props.training.uuid}</p>
            </output>
            <menu>
              <button onClick={this.addEmptySegment} className="button-flat">add empty segment</button>
            </menu>
            <menu>
              <button onClick={this.exportTraining} className="button-flat">export training</button>
              <button onClick={this.emitClearTraining} className="button-flat button-warning">clear training</button>
              <button onClick={this.removeTraining} className="button-flat">remove training</button>
            </menu>
          </div>
        </section>
      );
    };
  }
