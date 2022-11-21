import React from "react";
import { Table } from "react-bootstrap";


export default function DisplayInfos(props) {
  /**
   * Displays a table with information on the selected dataset.
   * The information consists of Subjects, Behaviors and Behavioral Categories
   */

  //return title and table
  return (
    <div id="infos" className="padded text">
      <h3>General Information</h3>
      <div className="border background">
        {/*display name of uploaded file*/}
        <h5>{props.upload_name}</h5>
        <br></br>
        {props.upload_name && (<div>
          <Table striped bordered>
            <thead>
              <tr>
                <th>Column</th>
                <th>Unique Values</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Subject</b></td>
                <td>
                  {props.ids.map((id) => (
                    <span key={id}>{id + ", "}</span>
                  ))}
                </td>
              </tr>
              <tr>
                <td><b>Behavior</b></td>
                <td>
                  {props.behaviors.map((id) => (
                    <span key={id}>{id + ", "}</span>

                  ))}
                </td>
              </tr>
              <tr>
                <td><b>Behavioral Category</b></td>
                <td>
                  {props.categories.map((id) => (
                    <span key={id}>{id + ", "}</span>
                  ))}
                </td>
              </tr>
              <tr>
                <td><b>Modifier 1</b></td>
                <td>
                  {props.modifier_1s.map((id) => (
                    <span key={id}>{id + ", "}</span>

                  ))}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>)}
      </div>

    </div>
  );
}
