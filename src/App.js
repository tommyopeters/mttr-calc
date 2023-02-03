import React, { useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { DataGrid } from '@mui/x-data-grid';

import './App.css';

const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  browseFile: {
    width: '20%',
  },
  acceptedFile: {
    border: '1px solid #ccc',
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    width: '80%',
  },
  remove: {
    borderRadius: 0,
    padding: '0 20px',
  },
  progressBarBackgroundColor: {
    backgroundColor: 'red',
  },
};

function App() {
  const [columns, setColumns] = useState(null);
  const [results, setResults] = useState(null);
  const [totalLeadTime, setTotalLeadTime] = useState(0);
  const result = [];
  const { CSVReader } = useCSVReader();

  const calcLeadTime = (res) => {
    let titles = res.data.shift();
    console.log(titles);
    let cols = [];
    titles.forEach((title, index) => {
      cols.push({ field: title, headerName: title });
    });
    cols.push({ field: 'lead-time', headerName: 'Lead Time', width: 150 });
    setColumns(cols);
    let leadTime = 0;
    res.data.forEach((row) => {
      let obj = {};
      titles.forEach((title, index) => {
        obj[title] = row[index];
      });
      let diff;
      if (obj['Closed Date']) {
        diff = Math.abs(new Date(obj['Closed Date']) - new Date(obj['Created Date']));
      } else {
        diff = Math.abs(new Date() - new Date(obj['Created Date']));
      }

      // console.log(new Date(obj['Closed Date']));
      obj['lead-time'] = (diff / (1000 * 60 * 60)).toFixed(2);
      obj['id'] = obj['ID'];
      result.push(obj);

      leadTime += obj['lead-time'] * 1;
    });
    setTotalLeadTime(leadTime);
    setResults(result);
    console.log(results);
  };

  return (
    <div className='App'>
      {/* <input type='file' accept='.csv' /> */}
      <CSVReader onUploadAccepted={calcLeadTime}>
        {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
          <>
            <div style={styles.csvReader}>
              <button type='button' {...getRootProps()} style={styles.browseFile}>
                Browse file
              </button>
              <div style={styles.acceptedFile}>{acceptedFile && acceptedFile.name}</div>
              <button {...getRemoveFileProps()} style={styles.remove}>
                Remove
              </button>
            </div>
            <ProgressBar style={styles.progressBarBackgroundColor} />
          </>
        )}
      </CSVReader>
      {columns && (
        <div style={{ height: 650, width: '100%' }}>
          <DataGrid rows={results} columns={columns} pageSize={50} rowsPerPageOptions={[50]} checkboxSelection />
        </div>
      )}
      {totalLeadTime && (
        <div>
          <strong>Total Lead Time = {totalLeadTime.toLocaleString()} hours</strong>
          <br />
          <strong>Mean Time To Respond (MTTR) = {(totalLeadTime / results.length).toLocaleString()} hours</strong>
        </div>
      )}
    </div>
  );
}

export default App;
