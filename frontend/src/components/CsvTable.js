import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import '../css/CsvTable.css'; // Import a CSS file for styling (create this file)

const CsvTable = (props) => {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(props.graph);
        const csvText = await response.text();

        // Parse the CSV using papaparse
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setData(result.data);
          },
        });
      } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
      }
    };

    fetchData();
  }, [props.graph]); // This dependency ensures the effect runs when props.graph changes

  const roundToFiveDigits = (value) => {
    if (typeof value === 'number') {
      return round(value, 5);
    }
    return value;
  };

  const round = (num, places) => {
    const multiplier = 10 ** places;
    return Math.round(num * multiplier) / multiplier;
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="csv-table-container">
      <div className="toggle-button-container">

        <button type="button" className="btn btn-link custom-btn" onClick={toggleVisibility}>
          {isVisible ? 'Hide Statistics' : 'Show Statistics'}
        </button>

      </div>
      {isVisible && (
        <table className="csv-table">
          <thead>
            {data.length > 0 && (
              <tr>
                {Object.keys(data[0]).map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, columnIndex) => (
                  <td key={columnIndex}>{roundToFiveDigits(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CsvTable;
