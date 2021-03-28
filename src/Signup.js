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

export function Signup() {
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("userName").value + "@db.lv";
    const password = document.getElementById("password").value;
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        window.location.assign(`/${email}`);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.form} style={{ zindex: 1 }}>
        <form className={classes.loginForm} onSubmit={handleSubmit}>
          <div style={{ display: "flex", paddingLeft: 47 }}>
            <input
              type="text"
              id="userName"
              placeholder="username"
              pattern="[^\/@._*123456789]+"
              title="Nevar būt skaitļi 1-9 un simboli: / @ . _ *"
            />
            <div>@db.lv</div>
          </div>
          <input type="password" id="password" placeholder="password" />
          <br />
          <button>reģistrēties</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
