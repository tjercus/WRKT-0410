import * as React from "react";
import SegmentContainer from "./SegmentContainer";
import NameComponent from "./NameComponent";
import {createUuid} from "../shell/objectUtil";

/**
 * View Component as pure function for rendering one Training
 * @param {Object} props
 * @returns {XML} react jsx
 * @constructor
 */
const TrainingView = props => {
  console.log("TrainingView received props: ", JSON.stringify(props));
  let panelClassName = "panel";
  // let segments = props.training.segments || [];
  let segmentComponents = props.training.segments.map((segment, i) => {
    console.log("TrainingView, individual segment being iterated", JSON.stringify(segment));
    // IMPORTANT: using a new key every time TrainingView is called is the only way to force
    //  React to re-render the list with the latest props
    return (<SegmentContainer key={createUuid()}
                              eventbus={props.eventbus}
                              segment={segment} />);
  });

  let totalDistance = 0;
  if (props.training.total && props.training.total.distance) {
    totalDistance = (props.training.total.distance).toFixed(3);
  }

// TODO refactor to ButtonChoiceComponent
  const type1ButtonClassName = (props.training.type === "workout")
    ? "button-choice button-choice-selected" : "button-choice";
  const type2ButtonClassName = (props.training.type === "easy")
    ? "button-choice button-choice-selected" : "button-choice";

  if (props.training.uuid) {
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          <NameComponent
            name={props.training.name}
            onNameChange={props.onNameChange}
            onNameBlur={props.onNameBlur} />
        </header>
        <div className="panel-body">
          <fieldset name="type">
            Type of training &nbsp;
            <button onClick={props.onTypeClick} value="workout"
                    className={type1ButtonClassName}>{"workout"}</button>
            <button onClick={props.onTypeClick} value="easy"
                    className={type2ButtonClassName}>{"easy run"}</button>
          </fieldset>
          <table summary="training segments">
            <thead>
            <tr>
              <th>Distance</th>
              <th>Duration</th>
              <th>Pace</th>
              <th>Actions</th>
              <th>Info</th>
            </tr>
            </thead>
            <tbody>
            {segmentComponents}
            </tbody>
          </table>
          <output name="totals">
            <p>
              {"Total distance:"} <em>{totalDistance}</em> {"km, "}
              {"duration:"} <em>{props.training.total.duration}</em> {", "}
              {"average pace:"} <em>
              <time>{props.training.total.pace}</time>
            </em>
            </p>
            <p>UUID: {props.training.uuid}</p>
          </output>
          <menu>
            <button onClick={props.addEmptySegment} className="button-flat">add empty segment
            </button>
          </menu>
          <menu>
            <button onClick={props.emitAddToBeginOfPlan} value="add-to-plan" className="button-flat">
              add to begin of plan
            </button>
            <button onClick={props.emitAddToMiddleOfPlan} value="add-to-middle-plan"
                    className="button-flat">add to middle of plan
            </button>
            <button onClick={props.emitAddToPlan} value="add-to-end-plan" className="button-flat">add
              to end of plan
            </button>
            <button onClick={props.emitAddToSelectedWeekOfPlan} value="add-to-selected"
                    className="button-flat">add to selected week
            </button>
          </menu>
          <menu>
            <button onClick={props.exportTraining} className="button-flat">export training</button>
            <button onClick={props.emitClearTraining} className="button-flat button-warning">clear
              training
            </button>
            <button onClick={props.cloneTraining} className="button-flat">clone training</button>
            <button onClick={props.removeTraining} className="button-flat">remove training</button>
          </menu>
          <menu>
            <button onClick={props.emitPersistChanges} className="button-flat" id="persist-button">
              persist changes
            </button>
          </menu>
        </div>
      </section>
    );
  } else {
    return (
      <section className={panelClassName}>
        <header className="panel-header">
          {props.training.name} {props.training.uuid}
        </header>
        <div className="panel-body">
          {"Please choose a training from the left-hand list"}
        </div>
      </section>
    );
  }
};
export default TrainingView;