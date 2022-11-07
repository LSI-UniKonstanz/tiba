import { Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';

export default function ExampleData(props) {
  /**
   * Enables the user to select 1 out of 3 example datasets
   */

  const upload_name = "upload_name";

  const loadExample = (e) => {
    //Name is passed to backend to retrieve corresponding data
    props.passExample({
      [e.target.name]: e.target.name,
    });
    //Title is passed to be displayed in "General Information"
    props.passName({
      [upload_name]: e.target.title,
    });
  };

  return (
    <div className="padded text">
      <h3>Alternative: Load Example Data</h3>
      <div className="border background ">
        <p> The data is provided by <a href="https://www.ab.mpg.de/person/98178">Etienne Lein</a> from the Max Planck Institute of Animal Behavior.
          He studies the evolution of social behavior in the Lamprologine cichlids of Lake Tanganyika.
          Each of the following examples shows the behavioral events of one species derived from 20-minute videos.
        </p>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>
                <Button
                  name="example1"
                  title="Neolamprologus multifasciatus"
                  className="button"
                  onClick={loadExample}
                >
                  Neolamprologus multifasciatus
                </Button></th>
              <th>
                <Button
                  name="example2"
                  title="Telmatochromis temporalis"
                  className="button"
                  onClick={loadExample}
                >
                  Telmatochromis temporalis
                </Button></th>
              <th>
                <Button
                  name="example3"
                  title="Lamprologus ocellatus"
                  className="button"
                  onClick={loadExample}
                >
                  Lamprologus ocellatus
                </Button></th>
            </tr>
          </thead>

        </Table>


        <p> </p>

        <p> </p>

      </div>
    </div>
  );
}
