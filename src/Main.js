// React
import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import Items from "./Items.js";
import { Link } from "react-router-dom";

// Firebase
import firebase from "firebase/app";

// Material UI
import {
  Button,
  AppBar,
  Tabs,
  Grid,
  Tab,
  IconButton,
  Box,
} from "@material-ui/core";
import AppsIcon from "@material-ui/icons/Apps";
import { makeStyles } from "@material-ui/styles";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBydKTwKKW9fazXdOhyOo6LA_P1KXFQ1FQ",
    authDomain: "kro-wearhouse-tracker.firebaseapp.com",
    databaseURL:
      "https://kro-wearhouse-tracker-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kro-wearhouse-tracker",
    storageBucket: "kro-wearhouse-tracker.appspot.com",
    messagingSenderId: "1050192643523",
    appId: "1:1050192643523:web:e91826b890b2b5102e2976",
  });
} else firebase.app();

const useStyles = makeStyles((theme) => ({
  textArea: {
    flex: "0 0",
  },
  form: {
    display: "flex",
    height: 75,
  },
  textField: {
    fontSize: 17,
    paddingLeft: 12,
    flex: "1 1",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    border: "0.5px solid grey",
    minWidth: 100,
    "&:focus": {
      outline: "grey solid 0px",
      border: "1px solid black",
    },
    "&:hover": {
      border: "0.5px solid black",
    },
  },
}));

const listenItems = (db) => (dispatch) => {
  const rtdbRef = firebase.database().ref(`${db}/items`);

  rtdbRef.on("value", (snapshot) => {
    if (snapshot.val() !== null) {
      const itemArr = Object.entries(snapshot.val());
      dispatch({
        type: "SET_ITEMS",
        payload: itemArr,
      });
    }
  });
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}
function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

function Main(props) {
  const [value, setValue] = useState(0);
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const classes = useStyles();

  const db = props.match.params.db;
  const { allItems } = props;

  useEffect(() => {
    let dateObj = new Date();

    let month = dateObj.getUTCMonth() + 1;
    let day = dateObj.getUTCDate() - 4;
    let year = dateObj.getUTCFullYear();

    function getDayName(dateStr, locale) {
      var date = new Date(dateStr);
      return date.toLocaleDateString(locale, { weekday: "long" });
    }
    var isMonday =
      getDayName(month + "/" + day + "/" + year, "lv-LV") === "Pirmdiena";

    console.log(isMonday);

    dispatch(listenItems(db));
    // eslint-disable-next-line
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmitItem = (category, e) => {
    e.preventDefault();
    if (text !== "") {
      firebase.database().ref(`${db}/items/${category}/${text}`).set({
        amount: 1,
        type: "kg",
        increment: 1,
        price: 1,
        timestamp: Date.now(),
      });
      setText("");
    }
  };

  return (
    <div style={{ backgroundColor: "#a9a9a9" }}>
      <AppBar position="static" color="default">
        <Tabs
          style={{ paddingRight: 48 }}
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs"
        >
          {allItems !== undefined &&
            allItems.map((data, key) => (
              <Tab label={data[0]} key={key} {...a11yProps(key - 1)} />
            ))}
        </Tabs>
        <IconButton
          style={{ position: "absolute", right: 4, top: 0 }}
          component={Link}
          to={`/table/${db}`}
        >
          <AppsIcon />
        </IconButton>
      </AppBar>
      <div>
        {allItems !== undefined ? (
          allItems.map((data, key) => (
            <TabPanel value={value} index={key} key={key}>
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  style={{ alignSelf: "center" }}
                >
                  <div className={classes.textArea}>
                    <form className={classes.form}>
                      <input
                        id="textBoxInput"
                        name="text"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className={classes.textField}
                        maxLength="90"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitItem.bind(this, data[0])}
                      >
                        Iet
                      </Button>
                    </form>
                  </div>
                </Grid>
                <Items
                  data={data}
                  value={value}
                  onChange={handleChange}
                  db={db}
                />
              </Grid>
            </TabPanel>
          ))
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} style={{ alignSelf: "center" }}>
              <div className={classes.textArea}>
                <form className={classes.form}>
                  <input
                    id="textBoxInput"
                    name="text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={classes.textField}
                    maxLength="90"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitItem.bind(this, "Nešķirots")}
                  >
                    Iet
                  </Button>
                </form>
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({ allItems: state.allItems });

export default connect(mapStateToProps, {})(Main);
