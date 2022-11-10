import { React } from "react";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";

export default function Plot(props) {

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
      <h3>Behavior graph</h3>
      <div className="border background">
        <p>The behavior graph displays the temporal occurrences of behavioral events. It maps values from the column <i>Time</i> to the x axis and the cumulative count of behaviors shown up to that time separately for each individual to the y axis. Individuals or individual behaviors may be deselected.</p>
        <br></br>
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
