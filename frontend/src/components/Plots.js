import React, { useEffect } from "react";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";

export default function Plot(props) {

  //initialise 
  useEffect(
    () => props.passValues({ behavior: props.options[0] }),
    [props.options]
  );

  // request new calculation if user clicks on apply changes
  const applyChanges = () => {
    props.passValues({
      request_new_plot: true
    })
    props.passValues({
      plot_new_config: false
    })
  }

  // Passes a new list after Subject selection to parent component Generate.js
  const handleIDSelect = (e) => {
    const newList = toggleValueInList(props.p_id_list, e.target.name)
    props.passValues({
      p_id_list: newList,
    });
    props.passValues({
      plot_new_config: true
    });
  }

  //passes a new list after behavior selection to parent component Generate.js
  const handleBehaviorSelect = (e) => {
    const newList = toggleValueInList(props.p_bhvr_list, e.target.name)
    props.passValues({
      p_bhvr_list: newList
    });
    props.passValues({
      plot_new_config: true
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

  //export/download svg
  const downloadSVG = () => {
    let url = props.image
    let filename = props.upload_name.split(' ').join('_') + "_plot"
    saveAs(url, filename);
  }

  return (
    <div className="padded text">
      <h3>Behaviour graph</h3>
      <div className="border background">
        <p>The behaviour graph displays the temporal occurrences of behavioural events. 
          It uses values from the column <i>Time</i> for the x-values and the cumulative count of behaviours shown up to that time separately for each individual for the y-values. 
        Behaviours and individuals may be deselected.</p>

        <br></br>
        {/*         <label htmlFor="behavior">
          Choose <b>behavior</b> to display
        </label>
        <select
          className="params"
          name="behavior"
          id="behavior"
          onChange={change}
        >
          {props.options.map((item) => {
            return (
              <option key={item} value={item}>
                {item}
              </option>
            );
          })}
        </select>
        <p> </p> */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Deselect Subjects</th>
              <th>Deselect Behaviors</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {props.ids.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'p' + id} name={id} autoComplete="off" onChange={handleIDSelect}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'p' + id}>{id}</label>
                </span>)}
              </td>
              <td>
                {/*display behaviors if network is using behaviors as nodes*/}
                {props.behaviors.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'pb' + id} name={id} autoComplete="off" onChange={handleBehaviorSelect}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'pb' + id}>{id}</label>
                </span>)}
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="left-panel-25">
          {/* apply button to give changes to parent and thus request new calculation */}
          {props.plot_new_config && (<button type="button" className="btn btn-success btn-lg" onClick={applyChanges}>Apply changes</button>)}
          {!props.plot_new_config && (<button type="button" className="btn btn-secondary btn-lg" disabled>Apply changes</button>)}
        </div>
        <div className="right-panel-75">
          {/* download image */}
          <button type="button" className="btn btn-link custom-btn" onClick={downloadSVG}>{" "}{"\u21E9 export Image (.svg)"}{" "}</button>
        </div>
        <div className="imgbox">
          <img className="center-fit" src={props.image} alt="not loaded" />
        </div>
      </div>
    </div >
  );
}
