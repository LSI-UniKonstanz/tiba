import React from "react";
import "../css/images.css";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import CsvTable from "./CsvTable";

export default function Transitions(props) {

  // request new calculation if user clicks on apply changes
  const applyChanges = () => {
    props.passValues({
      request_new_transitions: true
    })
    props.passValues({
      transitions_new_config: false
    })
  }

  //passes the user selected values to the parent component Generate.js
  const handleChange = (e) => {
    props.passValues({
      [e.target.name]: e.target.value,
    });
    props.passValues({
      transitions_new_config: true
    });
  };

  //passes a new list after behavior selection to parent component Generate.js
  const handleIDSelect = (e) => {
    const newList = toggleValueInList(props.t_id_list, e.target.name)
    props.passValues({
      t_id_list: newList,
    });
    props.passValues({
      transitions_new_config: true
    });
  }

  //passes a new list after behavior selection to parent component Generate.js
  const handleBehaviorSelect = (e) => {
    const newList = toggleValueInList(props.t_bhvr_list, e.target.name)
    props.passValues({
      t_bhvr_list: newList,
    });
    props.passValues({
      transitions_new_config: true
    });
  }

  //passes a new list after behavior selection to parent component Generate.js
  const handleCategorySelect = (e) => {
    const newList = toggleValueInList(props.t_cat_list, e.target.name)
    props.passValues({
      t_cat_list: newList,
    });
    props.passValues({
      transitions_new_config: true
    });
  }

  // accepts an list and an value. Adds the value if not present
  // and remove it if present
  function toggleValueInList(list, value) {
    if (list.includes(value)) {
      return list.filter(item => item !== value)
    }
    else {
      list.push(value)
      return list
    }
  }

  //export image file (.svg)
  const downloadSVG = () => {
    let url = props.graph
    saveAs(url, props.upload_name.split(' ').join('_') + "_transitions");
  }

  // export graphviz raw file (.gv)
  const downloadGV = () => {
    //.slice removes the .svg at the end, it works as graphviz is saving .gv and .gv.svg anyway when rendering
    let url = props.graph.slice(0, -4)
    saveAs(url, props.upload_name.split(' ').join('_') + "_transitions");
  }

  // export graph modeling language (.gml)
  const downloadGML = () => {
    //.slice removes the .gv.svg at the end, then .gml is added as the other naming/location stays the same
    let url = props.graph.slice(0, -7) + ".gml"
    saveAs(url, props.upload_name.split(' ').join('_') + "_transitions");
  }

  // export statistics
  const downloadStatistics = () => {
    //.slice removes the .svg at the end, it works as graphviz is saving .gv and .gv.svg anyway when rendering
    let url = props.graph.slice(0, -7) + "-statistics.csv"
    saveAs(url, props.upload_name.split(' ').join('_') + "_interactions_statistics");
  }

  return (
    <div className="padded">
      <div className="text">
        <h3>Behavior transition network</h3>
        <div className="border background">
          <p>The behavior transition network displays temporal sequences of behavioral events. It is a directed, weighted network where the nodes represent either behaviors or behavioral categories and edges represent the transition from one behavior to another. Either the number of transitions or the transitional frequencies, i.e. the relative frequency with which a certain behavior follows another behavior, may be used as edge weighting. Individual behaviors, behavioral categories or individuals may be deselected and thereby excluded from the calculation and visualization. Node appearance may be altered by mapping the total number of behaviors, the average or total time of behaviors to node size, node color saturation or a label inside the node. The width of drawn edges may either be fixed or dependent on the weights, also a threshold for edges to be displayed may be set. Edge width, node size and node saturation may be normalized either in a linear or logarithmic fashion. Two color options are available: either each node and its outgoing edges have distinctive colors or a color is set and the nodes differentiate in the color saturation dependent on the mapping. In the context of network analysis, centrality measures are used to identify the most important nodes or actors within a network. It is possible to map the centralities to node size and color density. </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.in_degree_centrality.html#networkx.algorithms.centrality.in_degree_centrality" target="_blank" rel="noopener noreferrer">In-Degree Centrality</a>  quantifies the number of incoming transitions to a specific behavior. Behaviors with high in-degree centrality have a variety of possible preceding behaviors.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.out_degree_centrality.html#networkx.algorithms.centrality.out_degree_centrality" target="_blank" rel="noopener noreferrer">Out-Degree Centrality</a> quantifies the number of outgoing transitions from a particular behavior. Behaviors with high out-degree centrality have a variety of possible subsequent behaviors.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.closeness_centrality.html#networkx.algorithms.centrality.closeness_centrality" target="_blank" rel="noopener noreferrer">Closeness Centrality</a> considers the average distance from a behavior to all other behaviors. Closeness centrality in a behavior transition network assesses how quickly a behavior can be reached from other behaviors in terms of behavioral transitions.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.betweenness_centrality.html#networkx.algorithms.centrality.betweenness_centrality" target="_blank" rel="noopener noreferrer">Betweenness Centrality</a> measures the frequency with which a behavior lies on the shortest paths between pairs of other behaviors. Betweenness centrality in a behavior transition network identifies behaviors that act as critical connectors between other behaviors.
        </p>

          <br></br>
          <hr className="hr"></hr>
          <div className="left-panel">
            {/*switch for node type*/}
            <div className="margin-switches">
              <span><b>Node values:</b>&nbsp;&nbsp;&nbsp;</span>
              <BootstrapSwitchButton
                onlabel='Behavioral categories'
                offlabel='Behaviors'
                offstyle="primary"
                onstyle="primary"
                width="300"
                onChange={(checked) => {
                  props.passValues({ option: checked })
                  // Reset selected behaviors/categories onChange
                  if (checked) {
                    props.passValues({ t_bhvr_list: props.categories })
                  } else {
                    props.passValues({ t_bhvr_list: props.behaviors })
                  }
                  props.passValues({ transitions_new_config: true, })
                }}
              />
            </div>

            {/*switch for normalized outgoing edges*/}
            <div className="margin-switches">
              <span><b>Edge values:</b>&nbsp;&nbsp;&nbsp;</span>
              <BootstrapSwitchButton
                onlabel='Transition probability'
                offlabel='Amount of transitions'
                offstyle="primary"
                onstyle="primary"
                width="300"
                onChange={(checked) => {
                  props.passValues({ normalized: checked, })
                  //reset the min_edge_count as the slider ranges differ
                  props.passValues({ min_edge_count: 0 })
                  props.passValues({ transitions_new_config: true, })
                }}
              />
            </div>

            {/*           
          <div className="margin-switches">
            <span><b>Status use:</b>&nbsp;&nbsp;&nbsp;</span>
            <BootstrapSwitchButton
              onlabel='Split nodes into START/STOP'
              offlabel='Use for time calculation'
              offstyle="primary"
              onstyle="info"
              width="400"
              onChange={(checked) => {
                props.passValues({ with_status: checked })
              }}
            />
          </div> */}

            {/*switch for color type*/}
            <div className="margin-switches">
              <span><b>Color setting:</b>&nbsp;&nbsp;&nbsp;</span>
              <BootstrapSwitchButton
                onlabel='Distinct colors'
                offlabel='One color, differences in density'
                offstyle="primary"
                onstyle="primary"
                width="300"
                onChange={(checked) => {
                  props.passValues({ colored: checked })
                  props.passValues({ transitions_new_config: true, })
                }}
              />
            </div>

            {/*switch for custom edge thickness*/}
            <div className="mappings">
              <span><b>Edge width:</b>&nbsp;&nbsp;&nbsp;</span>
              <BootstrapSwitchButton
                onlabel='Fixed'
                offlabel='Dependent on value'
                offstyle="primary"
                onstyle="primary"
                width="300"
                onChange={(checked) => {
                  props.passValues({ custom_edge_thickness: checked, })
                  props.passValues({ transitions_new_config: true, })
                }}
              />
            </div>

            {/*switch for normalization (logarithmic or linear)*/}
            <div className="mappings">
              <span><b>Normalization:</b>&nbsp;&nbsp;&nbsp;</span>
              <BootstrapSwitchButton
                onlabel='Logarithmic'
                offlabel='Linear'
                offstyle="primary"
                onstyle="primary"
                width="300"
                onChange={(checked) => {
                  props.passValues({ logarithmic_normalization: checked, })
                  props.passValues({ transitions_new_config: true, })
                }}
              />
            </div>
            <div className="mappings">
              <span><b>Remove edges below:</b>&nbsp;&nbsp;&nbsp;</span>

              {props.normalized && (
                <input
                  className="form-control"
                  name="min_edge_count"
                  id="min_edge"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="0"
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{ width: '200px' }}
                ></input>
              )}
              {!props.normalized && (
                <input
                  className="form-control"
                  name="min_edge_count"
                  id="min_edge"
                  type="number"
                  placeholder="0"
                  min="0"
                  onChange={handleChange}
                  style={{ width: '200px' }}
                  onWheel={(e) => e.target.blur()}
                ></input>
              )}
            </div>

          </div>
          <div className="right-panel">
            {/*node size mapping*/}
            <div className="mappings">
              {/*               <label className="form-check-label" htmlFor="node_size_map">
                Map <b>node size</b>&nbsp;to
              </label> */}
              <span><b>Node size mapping:</b>&nbsp;&nbsp;&nbsp;</span>

              <select
                className="form-select"
                name="node_size_map"
                id="node_size_map"
                onChange={handleChange}
              >
                <option key="2" value="total_time">
                  Total time
                </option>
                <option key="3" value="avg_time">
                  Average time
                </option>
                <option key="4" value="amount">
                  Number of occurences
                </option>
                <option key="indeg" value="indeg">
                  In-Degree Centrality
                </option>
                <option key="outdeg" value="outdeg">
                  Out-Degree Centrality
                </option>
                <option key="closeness" value="closeness">
                  Closeness Centrality
                </option>
                <option key="betweenness" value="betweenness">
                  Betweenness Centrality
                </option>
              </select>
            </div>
            {/*node label mapping*/}
            <div className="mappings">
              <span><b>Node label mapping:</b>&nbsp;&nbsp;&nbsp;</span>

              <select
                className="form-select"
                name="node_label_map"
                id="node_label_map"
                onChange={handleChange}
              >
                <option key="1" value="">
                  -
                </option>
                <option key="2" value="total_time">
                  Total time
                </option>
                <option key="3" value="avg_time">
                  Average time
                </option>
                <option key="4" value="amount">
                  Number of occurences
                </option>
              </select>
            </div>

            {/*node color mapping*/}
            {!props.with_status && !props.colored && (
              <div className="mappings">
                <label className="form-check-label" htmlFor="node_color_map">
                  <b>Color density mapping</b>&nbsp;
                </label>
                {/*                 <span><b>Node color density mapping:</b>&nbsp;&nbsp;&nbsp;</span>
 */}
                <select
                  className="form-select"
                  name="node_color_map"
                  id="node_color_map"
                  onChange={handleChange}
                >
                  <option key="2" value="total_time">
                    Total time
                  </option>
                  <option key="3" value="avg_time">
                    Average time
                  </option>
                  <option key="4" value="amount">
                    Number of occurences
                  </option>
                  <option key="indeg" value="indeg">
                    In-Degree Centrality
                  </option>
                  <option key="outdeg" value="outdeg">
                    Out-Degree Centrality
                  </option>
                  <option key="closeness" value="closeness">
                    Closeness Centrality
                  </option>
                  <option key="betweenness" value="betweenness">
                    Betweenness Centrality
                  </option>
                </select>
              </div>
            )}

            {/*color hue */}
            {!props.with_status && !props.colored && (
              <div className="mappings">
                {/*               <label htmlFor="color_hue" className="form-check-label">
                Choose <b>color hue</b>
              </label> */}
                <span><b>Color hue:</b>&nbsp;&nbsp;&nbsp;</span>

                <input
                  className="form-range"
                  name="color_hue"
                  id="color_hue"
                  type="range"
                  min="0"
                  max="180"
                  step="10"
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                ></input>
              </div>
            )}

            <div className="mappings">
              {!props.custom_edge_thickness && (<div>
                <span><b>Edge width factor:</b>&nbsp;&nbsp;&nbsp;</span>
                <input
                  className="form-range"
                  name="colored_edge_thickness"
                  id="colored_edge_thickness"
                  type="range"
                  min="1"
                  max="15"
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                ></input>
              </div>
              )}
            </div>

          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Deselect Subjects</th>
                {!props.option && (<th>Deselect Behaviors</th>)}
                {props.option && (<th>Deselect Behavioral Categories</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {props.ids.map(id => <span key={id}>
                    <input type="checkbox" className="btn-check" id={'tid' + id} name={id} autoComplete="off" onChange={handleIDSelect}></input>
                    <label className="btn btn-primary custom-btn shadow-none" htmlFor={'tid' + id}>{id}</label>
                  </span>)}
                </td>
                {<td>
                  {/*display behaviors if network is using behaviors as nodes*/}
                  {!props.option && (
                    props.behaviors.map(id => <span key={id}>
                      <input type="checkbox" className="btn-check" id={'tb' + id} name={id} autoComplete="off" onChange={handleBehaviorSelect}></input>
                      <label className="btn btn-primary custom-btn shadow-none" htmlFor={'tb' + id}>{id}</label>
                    </span>)
                  )}
                  {/*display categories if network is using categories as nodes*/}
                  {props.option && (
                    props.categories.map(id => <span key={id}>
                      <input type="checkbox" className="btn-check" id={'tc' + id} name={id} autoComplete="off" onChange={handleCategorySelect}></input>
                      <label className="btn btn-primary custom-btn shadow-none" htmlFor={'tc' + id}>{id}</label>
                    </span>)
                  )}
                </td>}
              </tr>
            </tbody>
          </Table>
          <div className="left-panel-25">
            {/* apply button to give changes to parent and thus request new calculation */}
            {props.transitions_new_config && (<button type="button" className="btn btn-success btn-lg" onClick={applyChanges}>Apply changes</button>)}
            {!props.transitions_new_config && (<button type="button" className="btn btn-secondary btn-lg" disabled>Apply changes</button>)}
          </div>
          <div className="right-panel-75">
            {/*download buttons for SVG, GV and GML files*/}
            <button type="button" className="btn btn-link custom-btn" onClick={downloadSVG}>{" "}{"\u21E9 export Image (.svg)"}{" "}</button>
            <button type="button" className="btn btn-link custom-btn" onClick={downloadGV}>{" "}{"\u21E9 export Graphviz (.gv)"}{" "}</button>
            <button type="button" className="btn btn-link custom-btn" onClick={downloadStatistics}>{" "}{"\u21E9 export statistics (.csv)"}{" "}</button>
          </div>
          {props.graph && (<CsvTable graph={props.graph.slice(0, -7) + "-statistics.csv"} />)}
        </div>
      </div>



      {/*image display*/}
      <div className="imgbox">
        <img className="center-fit" src={props.graph} alt="unable to load, bad parameters" />
      </div>

    </div>
  );
}
