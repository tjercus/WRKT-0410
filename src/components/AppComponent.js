import React from "react";
import packageJSON from "../../package.json";
import EventEmitter from "eventemitter2";
import MenuComponent from "./MenuComponent";
import PanelComponent from "./PanelComponent";
import TrainingComponent from "./TrainingComponent";
import TrainingListComponent from "./TrainingListComponent";
import TrainingStore from "../stores/TrainingStore";
import TimelineComponent from "./TimelineComponent";
import TimelineStore from "../stores/TimelineStore";
import DayEditComponent from "./DayEditComponent";

export default class AppComponent extends React.Component {

  constructor(props) {
    super(props);
    this.eventbus = new EventEmitter({wildcard: true, maxListeners: 99});
    // singleton SegmentStore
    this.trainingStore = new TrainingStore(this.eventbus);
    this.TimelineStore = new TimelineStore(this.eventbus);
  }
  
  componentDidMount() {
    this.eventbus.emit("TRAINING_LOAD_CMD", "new-training");
    this.eventbus.emit("MENU_CLICK_EVT", "menu-item-training");
  }
  
  render() {
    const version = packageJSON.version;

    return (
      <div>
        <header id="app-header">
          <h1>Trainingplanner {version}</h1>  
          <MenuComponent eventbus={this.eventbus} />
        </header>
        <article id="container">
          <aside id="container-aside">
            <TrainingListComponent eventbus={this.eventbus} name="Traininglist" from="menu-item-training" />
          </aside>
          <main>
            <TrainingComponent eventbus={this.eventbus} name="Training" from="menu-item-training" />
            <TimelineComponent eventbus={this.eventbus} name="Timeline" from="menu-item-timeline" />
            <PanelComponent eventbus={this.eventbus} name="Settings" from="menu-item-settings" />
            <DayEditComponent eventbus={this.eventbus} name="DayEdit" from="menu-item-dayedit" />
          </main>
        </article>
      </div>
    )
  }
};
