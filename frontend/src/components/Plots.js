import { React } from "react";
import { Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'


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

  //passes a new list after behavior selection to parent component Generate.js
  const handleCategorySelect = (e) => {
    const newList = toggleValueInList(props.p_cat_list, e.target.name)
    props.passValues({
      p_cat_list: newList,
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
      <h3>Behavior Accumulation Chart</h3>
      <div className="border background">
        <p>The Behavior Accumulation Chart displays the temporal occurrences of behavioral events. It maps values from the column <i>Time</i> to the x axis and the cumulative count of behaviors shown up to that time separately for each individual to the y axis. Individuals or individual behaviors may be deselected.
          </p><p><b> If the number of selected lineplots exceeds 10, only the first 10 lineplots, sorted in lexicographical order, will be displayed.</b></p>
        <br></br>
        <hr></hr>
        {/*switch behavioral categories / behaviors*/}
        <div className="margin-switches">
          <span><b>Selectable:</b>&nbsp;&nbsp;&nbsp;</span>
          <BootstrapSwitchButton
            onlabel='Behavioral categories'
            offlabel='Behaviors'
            offstyle="primary"
            onstyle="primary"
            width="300"
            onChange={(checked) => {
              props.passValues({ plot_categories: checked })
              // Reset selected behaviors/categories onChange
              if (checked) {
                props.passValues({ p_cat_list: props.categories })
              } else {
                props.passValues({ p_bhvr_list: props.behaviors })
              }
              props.passValues({ plot_new_config: true, })
            }}
          />
        </div>
        {/*switch for cumulative or separate behaviors */}
        <div className="margin-switches">
          <span><b>Lineplots:</b>&nbsp;&nbsp;&nbsp;</span>
          <BootstrapSwitchButton
            onlabel='Separate'
            offlabel='Cumulate'
            offstyle="primary"
            onstyle="primary"
            width="300"
            onChange={(checked) => {
              props.passValues({ separate: checked })
              props.passValues({ plot_new_config: true, })
            }}
          />
        </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Deselect Subjects</th>
              {!props.plot_categories && (<th>Deselect Behaviors</th>)}
              {props.plot_categories && (<th>Deselect Behavioral Categories</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {props.ids.map(id => <span key={id}>
                  <input type="checkbox" className="btn-check" id={'pid' + id} name={id} autoComplete="off" onChange={handleIDSelect}></input>
                  <label className="btn btn-primary custom-btn shadow-none" htmlFor={'pid' + id}>{id}</label>
                </span>)}
              </td>
              {<td>
                {/*display behaviors if network is using behaviors as nodes*/}
                {!props.plot_categories && (
                  props.behaviors.map(id => <span key={id}>
                    <input type="checkbox" className="btn-check" id={'pb' + id} name={id} autoComplete="off" onChange={handleBehaviorSelect}></input>
                    <label className="btn btn-primary custom-btn shadow-none" htmlFor={'pb' + id}>{id}</label>
                  </span>)
                )}
                {/*display categories if network is using categories as nodes*/}
                {props.plot_categories && (
                  props.categories.map(id => <span key={id}>
                    <input type="checkbox" className="btn-check" id={'pc' + id} name={id} autoComplete="off" onChange={handleCategorySelect}></input>
                    <label className="btn btn-primary custom-btn shadow-none" htmlFor={'pc' + id}>{id}</label>
                  </span>)
                )}
              </td>}
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
          <img className="center-fit" src={props.image} alt="unable to load, bad parameters" />
        </div>
      </div>
    </div >
  );
}
