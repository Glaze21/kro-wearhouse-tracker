// React
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import "whatwg-fetch";
import DataTable from "react-data-table-component";

// Firebase
import firebase from "firebase/app";
import "firebase/firestore";

import AppsIcon from "@material-ui/icons/Apps";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import AddIcon from "@material-ui/icons/Add";

function ExportButton(props) {
  const handleClick = () => {
    const { receiptData } = props;
    var csv = Papa.unparse(receiptData.rows, { skipEmptyLines: true });
    var _csv = csv.replace("id,", "");

    var encodedUri = encodeURI(_csv);
    var link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;utf-8,%EF%BB%BF," + encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link);

    link.click();
  };
  return (
    <Button
      variant="text"
      color="default"
      onClick={handleClick}
      style={{ position: "absolute", top: 5, left: 200, zIndex: 8 }}
    >
      export
    </Button>
  );
}

export function Table(props) {
  const { receiptData } = props;
  const db = props.match.params.db;
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);

  useEffect(() => {
    const data = { db: db, limit: 18 };
    const url =
      "https://europe-west3-kro-wearhouse-tracker.cloudfunctions.net/api/getReceipts";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        data.columns[0].width = "120px";
        dispatch({
          type: "SET_TABLE",
          payload: data,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("error");
      });

    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: "SET_UNAUTHENTICATED" });
        window.location.reload();
      });
  };

  const handleGetMoreData = () => {
    setCount(count + 1);
    const data = { db: db, limit: (count + 1) * 18 };
    const url =
      "https://europe-west3-kro-wearhouse-tracker.cloudfunctions.net/api/getReceipts";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        data.columns[0].width = "120px";
        dispatch({
          type: "SET_TABLE",
          payload: data,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("error");
      });
  };

  return (
    <div style={{ height: "100vh", width: "100%", backgroundColor: "white" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <IconButton
            style={{ position: "absolute", top: 0, left: 6, zIndex: 8 }}
            component={Link}
            to={`/${db}`}
          >
            <AppsIcon />
          </IconButton>
          <IconButton
            style={{ position: "absolute", top: 0, left: 50, zIndex: 8 }}
            onClick={handleLogout}
          >
            <ExitToAppIcon />
          </IconButton>
          <IconButton
            style={{ position: "absolute", top: 0, left: 100, zIndex: 8 }}
            component={Link}
            to={`/signup`}
          >
            <VpnKeyIcon />
          </IconButton>
          <IconButton
            style={{ position: "absolute", top: 0, left: 150, zIndex: 8 }}
            onClick={handleGetMoreData}
          >
            <AddIcon />
          </IconButton>
          <ExportButton receiptData={receiptData} />
          {receiptData !== undefined && (
            <DataTable
              pagination
              // columnBuffer={2}
              // density="compact"
              // checkboxSelection={false}
              columns={receiptData.columns}
              data={receiptData.rows}
              // pageSize={9}
              // components={{
              //   Toolbar: CustomToolbar,
              // }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({ receiptData: state.receiptData });

export default connect(mapStateToProps, {})(Table);
