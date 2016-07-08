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
import DayStore from "../stores/DayStore";
import DayEditComponent from "./DayEditComponent";
import NotificationComponent from "./NotificationComponent";

import { clone } from "../stores/miscUtil";

import { plans } from "../stores/plans";
import { trainings } from "../stores/trainings";
import { traininginstances } from "../stores/traininginstances";

export default class AppComponent extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.hasOwnProperty("eventbus")) {
      this.eventbus = this.props.eventbus;
    } else {
      this.eventbus = new EventEmitter({wildcard: true, maxListeners: 999999});
    }

    //console.log("AppComponent: " + JSON.stringify(this.plans));

    new DayStore(this.eventbus, clone(plans), clone(trainings), clone(traininginstances));
    new TrainingStore(this.eventbus, clone(trainings));
    new TimelineStore(this.eventbus, clone(plans), clone(trainings), clone(traininginstances));
  }
  
  componentDidMount() {
    this.eventbus.emit("SET_NOTIFICATION_TIMEOUT", 20000);
    this.eventbus.emit("MENU_CLICK_EVT", "menu-item-training");
    setTimeout(() => this.eventbus.emit("TRAINING_LOAD_CMD", "new-training"), 500);
  }

  render() {
    const version = packageJSON.version;

    return (
      <div>
        <header id="app-header">
          <h1>WRKT-0410 {version}</h1>  
          <MenuComponent eventbus={this.eventbus} />
        </header>
        <article id="container">
          <aside id="container-aside">
            <TrainingListComponent eventbus={this.eventbus} name="Traininglist" from="menu-item-training" />
          </aside>
          <main>
            <NotificationComponent eventbus={this.eventbus} />
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
