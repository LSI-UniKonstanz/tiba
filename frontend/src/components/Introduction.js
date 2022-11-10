import React from "react";
import { Table } from "react-bootstrap";
import example from "../data/download-example.xlsx";


export default function Introduction() {
  /**
   * Gives a general description of the website.
   * Displays a data template to download.
   */

  return (
    <div className="padded text">
      <h3>Description</h3>
      <div className="border background">
        <p>This tool models graphs from behavior data that is given as list ordered by time. Such data can be derived from the event-logging software <a href="https://www.boris.unito.it/">BORIS</a>.
          Three visualizations are available,depicting the temporal occurrences of behavioral events, the number and direction of interactions between individuals, and the behavioral transitions and their respective transitional frequencies. The options to set node and edge properties and to select behaviors and individuals allow for interactive customization of the output drawings, which can be downloaded afterwards.</p>

        <br></br>

        <h5>Procedure</h5>
        <p><b>1.</b> Load data - either click on one of the samples below or use the upload widget. </p>
        <p><b>2.</b> Check general information.</p>
        <p><b>3.</b> Investigate one of the three depicted charts.</p>
        <br></br>

        <h5>Example data <a href={example} download="example.xlsx">
          {" "}{"\u21E9 download template"}{" "}
        </a></h5>

        <Table striped bordered>
          <thead>
            <tr>
              <th>Time</th>
              <th>Subject</th>
              <th>Behavior</th>
              <th>Behavioral category</th>
              <th>Modifier 1</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0.178</td>
              <td>3</td>
              <td>chasing</td>
              <td>Restrained aggression</td>
              <td>1</td>
              <td>STOP</td>
            </tr>
            <tr>
              <td>9.43</td>
              <td>1</td>
              <td>operculum spread</td>
              <td>Restrained aggression</td>
              <td>2</td>
              <td>START</td>
            </tr>
            <tr>
              <td>9.935</td>
              <td>2</td>
              <td>operculum spread</td>
              <td>Restrained aggression</td>
              <td>1</td>
              <td>START</td>
            </tr>
            <tr>
              <td>9.938</td>
              <td>3</td>
              <td>all fins spread</td>
              <td>Restrained aggression</td>
              <td>1</td>
              <td>START</td>
            </tr>
            <tr>
              <td>10.24</td>
              <td>1</td>
              <td>operculum spread</td>
              <td>Restrained aggression</td>
              <td>2</td>
              <td>STOP</td>
            </tr>
            {/*             <tr>
              <td>80.684</td>
              <td>2</td>
              <td>all fins spread</td>
              <td>Restrained aggression</td>
              <td>1</td>
              <td>START</td>
            </tr>
            <tr>
              <td>80.684</td>
              <td>2</td>
              <td>biting</td>
              <td>Overt aggression</td>
              <td>3</td>
              <td>START</td>
            </tr> */}
          </tbody>
        </Table>


      </div>
    </div>
  );
}
