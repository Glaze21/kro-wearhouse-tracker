import React from "react";
import { makeStyles } from "@material-ui/styles";
import firebase from "firebase/app";

const useStyles = makeStyles((theme) => ({
  loginPage: {
    width: 360,
    padding: "8% 0 0",
    margin: "auto",
  },
  form: {
    position: "relative",
    background: "#a9bfa9",
    maxWidth: 360,
    margin: "0 auto 100px",
    padding: 45,
    textAlign: "center",
    boxShadow: "0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)",
  },
}));

export function Login() {
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("userName").value + "@db.lv";
    const password = document.getElementById("password").value;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.form} style={{ zindex: 1 }}>
        <form className={classes.loginForm} onSubmit={handleSubmit}>
          <input type="text" id="userName" placeholder="username" />
          <input type="password" id="password" placeholder="password" />
          <br />
          <button>login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
