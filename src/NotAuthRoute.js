import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

const NotAuthRoute = ({
  component: Component,
  authenticated,
  database,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      authenticated === true && database ? (
        <Redirect to={`/${database}`} />
      ) : (
        <Component {...props} />
      )
    }
  />
);

const mapStateToProps = (state) => ({
  authenticated: state.authenticated,
  database: state.database,
});

export default connect(mapStateToProps)(NotAuthRoute);
