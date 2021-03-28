import React from "react";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { createStore, applyMiddleware, compose } from "redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import "firebase/auth";
import "firebase/database";
import firebase from "firebase/app";

import theme from "./theme";
import Main from "./Main.js";
import Table from "./Table.js";
import Login from "./Login.js";
import AuthRoute from "./AuthRoute.js";
import NotAuthRoute from "./NotAuthRoute.js";
import Signup from "./Signup";

const initialState = {
  allItems: [],
  receiptData: null,
  authenticated: false,
  database: null,
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_ITEMS":
      return {
        ...state,
        allItems: action.payload,
      };
    case "SET_TABLE":
      return {
        ...state,
        receiptData: action.payload,
      };
    case "SET_AUTHENTICATED":
      return {
        ...state,
        authenticated: true,
      };
    case "SET_DATABASE":
      return {
        ...state,
        database: action.payload,
      };
    case "SET_UNAUTHENTICATED":
      return {
        ...state,
        allItems: [],
        receiptData: null,
        authenticated: false,
        database: null,
      };

    default:
      return state;
  }
};
const store = createStore(
  reducer,
  {},
  compose(
    applyMiddleware(...[thunk])
    //window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    store.dispatch({ type: "SET_AUTHENTICATED" });
    store.dispatch({
      type: "SET_DATABASE",
      payload: user.email.replace("@db.lv", ""),
    });
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={2}>
        <CssBaseline />
        <Provider store={store}>
          <div
            style={{
              backgroundColor: "#a9a9a9",
              minHeight: "100vh",
              flexGrow: 1,
            }}
          >
            <Router>
              <Switch>
                <NotAuthRoute exact path="/login" component={Login} />
                <AuthRoute exact path="/signup" component={Signup} />
                <AuthRoute exact path="/:db" component={Main} />
                <AuthRoute exact path="/table/:db" component={Table} />
                <Route path="*">
                  <Redirect to="/login" />
                </Route>
              </Switch>
            </Router>
          </div>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
