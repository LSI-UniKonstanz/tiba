import React from "react";
import "../css/images.css";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import CsvTable from './CsvTable';  // Import the CsvTable component

export default function Interactions(props) {
  /**
 * Displays and describes interaction network
 */

  // request new calculation if user clicks on apply changes
  const applyChanges = () => {
    props.passValues({
      request_new_interactions: true
    })
    props.passValues({
      interactions_new_config: false
    })
  }

  //passes selected object:value to parent component
  const handleChange = (e) => {
    props.passValues({
      [e.target.name]: e.target.value ? e.target.value : 0,
    });
    props.passValues({
      interactions_new_config: true
    });
  };

  // handle Subject selection and pass to parent
  const handleIDSelect = (e) => {
    const newList = toggleValueInList(props.i_id_list, e.target.name)
    props.passValues({
      i_id_list: newList,
    });
    props.passValues({
      interactions_new_config: true
    });
  }

  // Passes a new list after Subject selection to parent component Generate.js
  const handleMod1Select = (e) => {
    const newList = toggleValueInList(props.i_mod1_list, e.target.name)
    props.passValues({
      i_mod1_list: newList,
    });
    props.passValues({
      interactions_new_config: true
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
    saveAs(url, props.upload_name.split(' ').join('_') + "_interactions");
  }

  // export graphviz raw file (.gv)
  const downloadGV = () => {
    //.slice removes the .svg at the end, it works as graphviz is saving .gv and .gv.svg anyway when rendering
    let url = props.graph.slice(0, -4)
    saveAs(url, props.upload_name.split(' ').join('_') + "_interactions");
  }

  // export graph modeling language (.gml)
  const downloadGML = () => {
    //.slice removes the .gv.svg at the end, then .gml is added as the other naming/location stays the same
    let url = props.graph.slice(0, -7) + ".gml"
    saveAs(url, props.upload_name.split(' ').join('_') + "_interactions");
  }

  // export statistics
  const downloadStatistics = () => {
    //.slice removes the .svg at the end, it works as graphviz is saving .gv and .gv.svg anyway when rendering
    let url = props.graph.slice(0, -7) + "-statistics.csv"
    saveAs(url, props.upload_name.split(' ').join('_') + "_interactions_statistics");
  }

  return (
    <div className="padded text">
      <h3>Interaction network</h3>
      <div className="border background">

        <p>The interaction network displays the number and direction of interactions between individuals. It is a directed weighted network where edges are drawn from individual A to individual B if A is the subject of a behavior and B is the recipient (i.e. the corresponding value in the optional column <i>Modifier</i>). The number of interactions determines the weight of an edge. Individuals may be deselected and a weight threshold for edges to be displayed may be set. In the context of network analysis, centrality measures are used to identify the most important nodes or actors within a network. </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.in_degree_centrality.html#networkx.algorithms.centrality.in_degree_centrality" target="_blank" rel="noopener noreferrer">In-Degree Centrality</a> quantifies the number of incoming edges to a node, it is indicative of popularity or influence within the network, as it reflects the extent to which a node is the target of interactions.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.out_degree_centrality.html#networkx.algorithms.centrality.out_degree_centrality" target="_blank" rel="noopener noreferrer">Out-Degree Centrality</a> quantifies the number of outgoing edges from a node in an interaction network. Nodes with high out-degree centrality are actively engaging with other nodes, potentially serving as sources of information, influence, or resources.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.closeness_centrality.html#networkx.algorithms.centrality.closeness_centrality" target="_blank" rel="noopener noreferrer">Closeness Centrality</a> considers the average distance from a node to all other nodes. Nodes with high closeness centrality are well-connected.
        </p>
        <p>
        <a href="https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.betweenness_centrality.html#networkx.algorithms.centrality.betweenness_centrality" target="_blank" rel="noopener noreferrer">Betweenness Centrality</a> measures the frequency with which a node lies on the shortest paths between pairs of other nodes. Betweenness centrality identifies nodes that act as crucial intermediaries or bridges within an interaction network.
        </p>
        <br></br>
        <hr className="hr"></hr>
        <div className="left-panel">
          <span><b>Remove edges below:</b>&nbsp;&nbsp;&nbsp;</span>
          <input
            type="number"
            className="form-control"
            name="i_min_edge_count"
            id="i_min_edge_count"
            min="0"
            placeholder="0"
            style={{ width: '200px' }}
            onChange={handleChange}
            onWheel={(e) => e.target.blur()}
          ></input>
        </div>

        <div className="right-panel">
          {/*node size mapping*/}
          <div className="mappings">
            <label className="form-check-label" htmlFor="i_node_size_map">
              <b>Node size mapping</b>&nbsp;
            </label>
            <select
              className="form-select"
              name="i_node_size_map"
              id="i_node_size_map"
              onChange={handleChange}
            >
              <option key="-" value="-">
                -
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

          {/*node color mapping*/}
          <div className="mappings">
            <label className="form-check-label" htmlFor="i_node_color_map">
              <b>Node color density mapping</b>&nbsp;
            </label>
            <select
              className="form-select"
              name="i_node_color_map"
              id="i_node_color_map"
              onChange={handleChange}
            >
              <option key="-" value="-">
                -
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

          {/*color hue */}
          <div className="mappings">
            <span><b>Color hue:</b>&nbsp;&nbsp;&nbsp;</span>
            <input
              className="form-range"
              name="i_color_hue"
              id="i_color_hue"
              type="range"
              min="0"
              max="180"
              step="10"
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            ></input>
          </div>
        </div>

        <br className="br"></br>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Deselect nodes for outgoing edges </th>
              <th>Deselect nodes for incoming edges</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {props.ids.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'i' + id} name={id} autoComplete="off" onChange={handleIDSelect}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'i' + id}>{id}</label>
                </span>)}
              </td>
              <td>
                {props.modifier_1s.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'m' + id} name={id} autoComplete="off" onChange={handleMod1Select}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'m' + id}>{id}</label>
                </span>)}
              </td>
            </tr>

          </tbody>
        </Table>
        <div className="left-panel-25">
          {/* apply button to give changes to parent and thus request new calculation */}
          {props.interactions_new_config && (<button type="button" className="btn btn-success btn-lg" onClick={applyChanges}>Apply changes</button>)}
          {!props.interactions_new_config && (<button type="button" className="btn btn-secondary btn-lg" disabled>Apply changes</button>)}
        </div>
        <div className="right-panel-75">
          {/*download buttons*/}
          <button type="button" className="btn btn-link custom-btn" onClick={downloadSVG}>{" "}{"\u21E9 export Image (.svg)"}{" "}</button>
          <button type="button" className="btn btn-link custom-btn" onClick={downloadGV}>{" "}{"\u21E9 export Graphviz (.gv)"}{" "}</button>
          <button type="button" className="btn btn-link custom-btn" onClick={downloadGML}>{" "}{"\u21E9 export Graph Modeling Language (.gml)"}{" "}</button>
          <button type="button" className="btn btn-link custom-btn" onClick={downloadStatistics}>{" "}{"\u21E9 export statistics (.csv)"}{" "}</button>
        </div>
        {props.graph && (<CsvTable graph={props.graph.slice(0, -7) + "-statistics.csv"} />)}
        <div className="imgbox">
          <img className="center-fit" src={props.graph} alt="unable to load, bad parameters" />
        </div>
      </div>
    </div>
  );
}
