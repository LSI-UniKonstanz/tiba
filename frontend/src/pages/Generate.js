import { React, createRef, Component } from "react";
import { trackPromise } from "react-promise-tracker";
//import components
import Introduction from "../components/Introduction";
import Transitions from "../components/Transitions";
import Interactions from "../components/Interactions";
import Plots from "../components/Plots";
import Infos from "../components/Infos";
import Upload from "../components/Upload";
import ExampleData from "../components/ExampleData";

import "../css/layout.css";

//const url = "https://tiba.inf.uni-konstanz.de/"
const url = "http://127.0.0.1:8000/"


export default class Generate extends Component {
  constructor() {
    super();
    this.infoRef = createRef()
    this.state = {
      //upload
      upload: null,
      upload_successful: null,
      upload_response: null,
      upload_name: null,
      //general information on uploaded dataset
      headers: null,
      //dummys needed for first render when no input is provided
      ids: ['dummy'],
      modifier_1s: ['dummy'],
      behaviors: ['dummy'],
      categories: ['dummy'],
      // Interaction Network
      i_min_edge_count: 0,
      i_graph: null,
      i_id_list: ['dummy'],
      i_mod1_list: ['dummy'],
      // Behavior Plot
      behavior: null,
      show_grid: true,
      p_image: null,
      options: ["dummy"],
      p_id_list: ['dummy'],
      p_bhvr_list: ['dummy'],
      // Transition network
      option: false,
      min_edge_count: 0,
      with_status: false,
      normalized: false,
      colored: false,
      colored_edge_thickness: 2,
      color_hue: 150,
      node_color_map: "total_time",
      node_size_map: "total_time",
      node_label_map: "total_time",
      graph: null,
      t_id_list: ['dummy'],
      t_bhvr_list: ['dummy'],
      t_cat_list: ['dummy'],
      custom_edge_thickness: false,
      request_new_plot: true,
      plot_new_config: false,
      request_new_interactions: true,
      interactions_new_config: false,
      request_new_transitions: true,
      transitions_new_config: false,
      logarithmic_normalization: false,
    };
  }

  getTransitions = async () => {
    const formData = new FormData();
    formData.append("option", this.state["option"]);
    formData.append("min_edge_count", this.state["min_edge_count"]);
    formData.append("with_status", this.state["with_status"]);
    formData.append("normalized", this.state["normalized"]);
    formData.append("colored", this.state["colored"]);
    formData.append("custom_edge_thickness", this.state["custom_edge_thickness"]);
    formData.append(
      "colored_edge_thickness",
      this.state["colored_edge_thickness"]
    );
    formData.append("color_hue", this.state["color_hue"]);
    formData.append("node_color_map", this.state["node_color_map"]);
    formData.append("node_size_map", this.state["node_size_map"]);
    formData.append("node_label_map", this.state["node_label_map"]);
    formData.append("upload", this.state["upload"]);
    formData.append("logarithmic_normalization", this.state["logarithmic_normalization"]);
    // Selection of IDs
    formData.append("id_list", JSON.stringify(this.state.t_id_list));
    // Selection of behaviors/categories
    if (this.state.option) {
      formData.append('bhvr_list', JSON.stringify(this.state.t_cat_list));
    } else {
      formData.append("bhvr_list", JSON.stringify(this.state.t_bhvr_list));
    }

    await fetch(url + "api/transitions/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({ graph: data.graph }));
  };

  getInteractions = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);
    // Selection of IDs
    formData.append("id_list", JSON.stringify(this.state.i_id_list));
    formData.append("mod1_list", JSON.stringify(this.state.i_mod1_list));
    formData.append("min_edge_count", this.state["i_min_edge_count"]);

    await fetch(url + "api/interactions/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({ i_graph: data.graph }));
  };

  getBehaviorPlot = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);
    formData.append("behavior", this.state.behavior);
    // Selection of IDs
    formData.append("id_list", JSON.stringify(this.state.p_id_list));
    // Selection of Behaviors
    formData.append("bhvr_list", JSON.stringify(this.state.p_bhvr_list));

    await fetch(url + "api/behaviorplot/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => this.setState({ p_image: data.plot }));
  };

  /**
   * fetches general information on dataset after upload or example pick
   */
  getInfo = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);

    await fetch(url + "api/infos/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          headers: data.headers,
          ids: data.ids,
          modifier_1s: data.modifier_1s,
          behaviors: data.behaviors,
          categories: data.categories,
          options: data.behaviors,
          i_id_list: data.ids,
          i_mod1_list: data.modifier_1s,
          p_id_list: data.ids,
          p_bhvr_list: data.behaviors,
          t_id_list: data.ids,
          t_bhvr_list: data.behaviors,
          t_cat_list: data.categories,
          // Show all outputs again as state has been reset
          reset_params: false,
        })
      )
      //scroll to information section
      .then(() => this.infoRef.current.scrollIntoView())
  }

  validateUpload = async () => {
    const formData = new FormData();
    formData.append("upload", this.state["upload"]);

    await fetch(url + "api/upload/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          upload_successful: data.success,
          upload_response: data.response,
        })
      )
  };

  updateExampleData = (obj) => {
    this.setState({
      upload: obj[Object.keys(obj)[0]],
      reset_params: true,
      //general information on uploaded dataset
      headers: null,
      //dummys needed for first render when no input is provided
      ids: ['dummy'],
      modifier_1s: ['dummy'],
      behaviors: ['dummy'],
      categories: ['dummy'],
      //specific for interaction network
      i_min_edge_count: 0,
      i_graph: null,
      i_id_list: ['dummy'],
      i_mod1_list: ['dummy'],
      //specific for behavior plot
      behavior: null,
      show_grid: true,
      p_image: null,
      options: ["dummy"],
      p_id_list: ['dummy'],
      p_bhvr_list: ['dummy'],
      //specific for transition network
      option: false,
      min_edge_count: 0,
      with_status: false,
      normalized: false,
      colored: false,
      colored_edge_thickness: 2,
      color_hue: 150,
      node_color_map: "total_time",
      node_size_map: "total_time",
      node_label_map: "-",
      graph: null,
      t_id_list: ['dummy'],
      t_bhvr_list: ['dummy'],
      t_cat_list: ['dummy'],
      custom_edge_thickness: false,
      request_new_plot: true,
      plot_new_config: false,
      request_new_interactions: true,
      interactions_new_config: false,
      request_new_transitions: true,
      transitions_new_config: false,
      logarithmic_normalization: false,
    }, () => {
      trackPromise(this.validateUpload());
      trackPromise(this.getInfo());
      trackPromise(this.getTransitions())
      trackPromise(this.getInteractions());
      trackPromise(this.getBehaviorPlot());
    });
  };

  // updates all state vars related to behavior plot
  updatePlot = (obj) => {
    this.setState({ [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]] }, () => {
      // if apply button has been clicked then request new calculation, otherwise just set vars
      if (this.state.request_new_plot) {
        trackPromise(
          this.getBehaviorPlot()
        );
      }
    });
    // reset value of apply button
    this.state.request_new_plot = false
  };

  updateInteractionNetwork = (obj) => {
    this.setState({ [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]] }, () => {
      // if apply button has been clicked then request new calculation, otherwise just set vars
      if (this.state.request_new_interactions) {
        trackPromise(
          this.getInteractions()
        );
      }
    });
    // reset value of apply button
    this.state.request_new_interactions = false
  };

  updateTransitionNetwork = (obj) => {
    this.setState({ [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]] }, () => {
      // if apply button has been clicked then request new calculation, otherwise just set vars
      if (this.state.request_new_transitions) {
        trackPromise(
          this.getTransitions()
        );
      }
    });
    // reset value of apply button
    this.state.request_new_transitions = false
  };

  updateUpload = (obj) => {
    this.setState({
      [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]],
      // Reset all settings
      // Reset the parameters
      reset_params: true,
      //general information on uploaded dataset
      headers: null,
      //dummys needed for first render when no input is provided
      ids: ['dummy'],
      modifier_1s: ['dummy'],
      behaviors: ['dummy'],
      categories: ['dummy'],
      //specific for interaction network
      i_min_edge_count: 0,
      i_graph: null,
      i_id_list: ['dummy'],
      i_mod1_list: ['dummy'],
      //specific for behavior plot
      behavior: null,
      show_grid: true,
      p_image: null,
      options: ["dummy"],
      p_id_list: ['dummy'],
      p_bhvr_list: ['dummy'],
      //specific for transition network
      option: false,
      min_edge_count: 0,
      with_status: false,
      normalized: false,
      colored: false,
      colored_edge_thickness: 2,
      color_hue: 150,
      node_color_map: "total_time",
      node_size_map: "total_time",
      node_label_map: "total_time",
      graph: null,
      t_id_list: ['dummy'],
      t_bhvr_list: ['dummy'],
      t_cat_list: ['dummy'],
      custom_edge_thickness: false,
      request_new_plot: true,
      plot_new_config: false,
      request_new_interactions: true,
      interactions_new_config: false,
      request_new_transitions: true,
      transitions_new_config: false,
      logarithmic_normalization: false,
    }, () => {
      // First reset all output diagrams and their parametrization
      trackPromise(this.validateUpload());
      trackPromise(this.getInfo());
      trackPromise(this.getTransitions());
      trackPromise(this.getInteractions());
      trackPromise(this.getBehaviorPlot());
    });
  };
  updateUploadName = (obj) => {
    this.setState(
      { [Object.keys(obj)[0]]: obj[Object.keys(obj)[0]] },
      () => { }
    );
  };

  render() {
    return (
      <div>
        <Introduction />
        <Upload
          passUpload={this.updateUpload}
          passName={this.updateUploadName}
        />
        <ExampleData
          passExample={this.updateExampleData}
          passName={this.updateUploadName}
        />
        {this.state.upload_response && (
          <div className="padded">
            <h4>Unfortunately we cannot handle the provided data:</h4>
            <h5>{this.state.upload_response}</h5>
          </div>
        )}
        <div ref={this.infoRef}>
          {this.state.upload_successful && (
            <Infos
              upload_name={this.state.upload_name}
              headers={this.state.headers}
              ids={this.state.ids}
              modifier_1s={this.state.modifier_1s}
              behaviors={this.state.behaviors}
              categories={this.state.categories}
            />
          )}
        </div>
        {/* Behavior-Time-Relation */}
        {this.state.upload_successful && !this.state.reset_params && (
          <Plots
            passValues={this.updatePlot}
            options={this.state.options}
            image={this.state.p_image}
            ids={this.state.ids}
            behaviors={this.state.behaviors}
            categories={this.state.categories}
            p_id_list={this.state.p_id_list}
            p_bhvr_list={this.state.p_bhvr_list}
            //upload name needed to name exported images
            upload_name={this.state.upload_name}
            plot_new_config={this.state.plot_new_config}
          />
        )}
        {/* Interaction network */}
        {this.state.upload_successful && !this.state.reset_params && (
          <Interactions
            ids={this.state.ids}
            modifier_1s={this.state.modifier_1s}
            behaviors={this.state.behaviors}
            categories={this.state.categories}
            passValues={this.updateInteractionNetwork}
            graph={this.state.i_graph}
            i_id_list={this.state.i_id_list}
            i_mod1_list={this.state.i_mod1_list}
            //upload name needed to name exported images
            upload_name={this.state.upload_name}
            interactions_new_config={this.state.interactions_new_config}
          />
        )}
        {/* Transition network */}
        {this.state.upload_successful && !this.state.reset_params && (
          <Transitions
            passValues={this.updateTransitionNetwork}
            graph={this.state.graph}
            normalized={this.state.normalized}
            colored={this.state.colored}
            option={this.state.option}
            with_status={this.state.with_status}
            min_edge_count={this.state.min_edge_count}
            ids={this.state.ids}
            behaviors={this.state.behaviors}
            categories={this.state.categories}
            t_id_list={this.state.t_id_list}
            t_bhvr_list={this.state.t_bhvr_list}
            t_cat_list={this.state.t_cat_list}
            custom_edge_thickness={this.state.custom_edge_thickness}
            //upload name needed to name exported images
            upload_name={this.state.upload_name}
            transitions_new_config={this.state.transitions_new_config}

          />
        )}
      </div>
    );
  }
}
