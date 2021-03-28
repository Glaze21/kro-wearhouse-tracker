// React
import React, { Fragment, useState, useEffect } from "react";

// Firebase
import firebase from "firebase/app";

import { makeStyles } from "@material-ui/styles";
import { useSnackbar } from "notistack";
import {
  Button,
  FormHelperText,
  InputBase,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  Input,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";

// Icons
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AssessmentIcon from "@material-ui/icons/Assessment";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  gridItem: {
    display: "flex",
  },
  functionBtns: {
    justifyContent: "center",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
  },
  amountBtns: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
  },
  paper: {
    fontSize: 21,
    textTransform: "capitalize",
    borderRadius: 0,
    flex: 1,
    padding: 16,
    textAlign: "center",
    backgroundColor: "white",
  },
  inputDiv: {
    paddingRight: 8,
    display: "flex",
    border: "1px solid #bfbfbf",
    borderRadius: 5,
    alignItems: "center",
    height: 38,
  },
  inputBox: {
    width: "100%",
    position: "relative",
    padding: 6,
  },
  title: {
    padding: "8px 24px 0",
    [theme.breakpoints.down("xs")]: {
      padding: "8px 12px 0",
    },
  },
  dialogRoot: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  dialogPaper: {
    margin: 18,
  },
  button: {
    fontSize: 9.5,
    fontFamily: "Open Sans, sans-serif",
    fontWeight: 500,
    lineHeight: 1.167,
    letterSpacing: "0em",
    textTransform: "uppercase",
    borderRadius: 10,
    maxWidth: 48,
    minWidth: 40,
    "&:hover": {
      backgroundColor: "#bb1354",
    },
  },
}));

export function Items(props) {
  const { data } = props;
  const db = props.db;
  const [newAmount, setNewAmount] = useState([]);
  const [dialog, setDialog] = useState({
    item: "",
    type: "",
    increment: 1,
    category: data[0],
    price: 1,
  });
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    var itemsToPush = [];
    var _data = Object.entries(data[1]);
    _data !== undefined &&
      _data.forEach((element, key) => {
        itemsToPush.push(element[1].amount);
        setNewAmount(itemsToPush);
      });
  }, [data]);

  const handleShowStats = (elm, e) => {
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    const newdate = day + "." + month + "." + year;

    firebase
      .firestore()
      .doc(`data/${newdate}_start_${db}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const itemAmountStart = doc.data().items[elm[0]];
          if (itemAmountStart) {
            const amount = elm[1].amount;
            const type = elm[1].type;
            alert(
              `Dienas sākumā: ${itemAmountStart} ${type}\nTagad: ${amount} ${type}\nIzlietoti: ${
                itemAmountStart - amount
              } ${type}`
            );
          } else {
            alert("Nav datu par šo produktu!");
          }
        } else {
          alert("Nav datu par šo dienu!");
        }
      });
  };
  const handleClickOpen = (elm, e) => {
    setOpen(true);
    setDialog({
      item: elm[0],
      type: elm[1].type,
      increment: elm[1].increment,
      category: data[0],
      price: elm[1].price,
    });
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDeleteItem = (itemToDelete, e) => {
    props.onChange(e, 0);
    firebase
      .database()
      .ref(`${db}/items/${data[0]}/${itemToDelete}`)
      .remove()
      .then(() => {
        enqueueSnackbar(`${itemToDelete} izdēsts!`, { variant: "info" });
      });
  };
  const handleSubmitAmount = (item, key, e) => {
    e.preventDefault();
    if (newAmount[key] !== "") {
      firebase
        .database()
        .ref(`${db}/items/${data[0]}/${item}`)
        .update({
          amount: parseFloat(newAmount[key].toString().replace(",", ".")),
        })
        .then(() =>
          enqueueSnackbar("Izmaiņas veiktas veiksmīgi!", { variant: "success" })
        );
    }
  };
  const handleSubmitType = (e) => {
    e.preventDefault();
    if (dialog.type !== "") {
      firebase
        .database()
        .ref(`${db}/items/${data[0]}/${dialog.item}`)
        .update({
          type: dialog.type,
        })
        .then(() =>
          enqueueSnackbar("Izmaiņas veiktas veiksmīgi!", { variant: "success" })
        );
    }
  };
  const handleSubmitIncrement = (e) => {
    e.preventDefault();
    if (dialog.increment !== "") {
      firebase
        .database()
        .ref(`${db}/items/${data[0]}/${dialog.item}`)
        .update({
          increment: parseFloat(dialog.increment.toString().replace(",", ".")),
        })
        .then(() =>
          enqueueSnackbar("Izmaiņas veiktas veiksmīgi!", { variant: "success" })
        );
    }
  };
  const handleSubmitPrice = (e) => {
    e.preventDefault();
    if (dialog.price !== "") {
      firebase
        .database()
        .ref(`${db}/items/${data[0]}/${dialog.item}`)
        .update({
          price: parseFloat(dialog.price.toString().replace(",", ".")),
        })
        .then(() =>
          enqueueSnackbar("Izmaiņas veiktas veiksmīgi!", { variant: "success" })
        );
    }
  };
  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (dialog.category !== "") {
      firebase
        .database()
        .ref(`${db}/items/${data[0]}/${dialog.item}`)
        .once("value")
        .then((snapshot) => {
          const data = snapshot.val();
          snapshot.ref.set(null).then(() => {
            firebase
              .database()
              .ref(`${db}/items/${dialog.category}/${dialog.item}`)
              .set(data);
          });
        })
        .then(() =>
          enqueueSnackbar("Izmaiņas veiktas veiksmīgi!", { variant: "success" })
        );
    }
  };
  const handleChangeAmount = (amountToIncrement, item, e) => {
    firebase
      .database()
      .ref(`${db}/items/${data[0]}/${item}`)
      .once("value")
      .then((snapshot) => {
        var amount = snapshot.val().amount;
        var increment = snapshot.val().increment;
        snapshot.ref.update({ amount: amount + amountToIncrement * increment });
      });
  };
  const handleRegEx = (e) => {
    setDialog({
      ...dialog,
      // eslint-disable-next-line
      [e.target.name]: e.target.value.replace(/[^0-9 \. ,]/, ""),
    });
  };
  return (
    <Fragment>
      {Object.entries(data[1]).map((elm, key) => (
        <Grid item key={key} xs={12} sm={6} md={4} className={classes.gridItem}>
          <div className={classes.functionBtns}>
            <IconButton onClick={handleClickOpen.bind(this, elm)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleShowStats.bind(this, elm)}>
              <AssessmentIcon />
            </IconButton>
            <Dialog
              id={`dialog_${key}`}
              key={key}
              open={open && key === 0}
              onClose={handleClose}
              classes={{ root: classes.dialogRoot, paper: classes.dialogPaper }}
            >
              <DialogTitle className={classes.title}>
                Rediģēt "{dialog.item}"
                <IconButton onClick={handleDeleteItem.bind(this, dialog.item)}>
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  onClick={handleClose}
                  style={{ position: "absolute", right: 10 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <form onSubmit={handleSubmitType}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <FormHelperText style={{ color: "black" }}>
                        Mērvienība
                      </FormHelperText>
                      <div className={classes.inputDiv}>
                        <InputBase
                          fullWidth
                          className={classes.inputBox}
                          type="text"
                          value={dialog.type}
                          onChange={(e) =>
                            setDialog({ ...dialog, type: e.target.value })
                          }
                        />
                        <Button
                          onClick={handleSubmitType}
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          type="button"
                        >
                          <div>Mainīt</div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
                <form onSubmit={handleSubmitIncrement}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <FormHelperText style={{ color: "black" }}>
                        Pieaugums
                      </FormHelperText>
                      <div className={classes.inputDiv}>
                        <InputBase
                          onFocus={(e) =>
                            e.target.addEventListener("input", handleRegEx)
                          }
                          onBlur={(e) =>
                            e.target.removeEventListener("input", handleRegEx)
                          }
                          name="increment"
                          type="text"
                          fullWidth
                          id={`increment_${elm[0]}`}
                          value={dialog.increment}
                          className={classes.inputBox}
                          onChange={(e) =>
                            setDialog({
                              ...dialog,
                              increment: e.target.value,
                            })
                          }
                        />
                        <Button
                          onClick={handleSubmitIncrement}
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          type="button"
                        >
                          Mainīt
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
                <form onSubmit={handleSubmitCategory}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <FormHelperText style={{ color: "black" }}>
                        Kategorija
                      </FormHelperText>
                      <div className={classes.inputDiv}>
                        <InputBase
                          fullWidth
                          className={classes.inputBox}
                          type="text"
                          margin="dense"
                          value={dialog.category}
                          onChange={(e) =>
                            setDialog({
                              ...dialog,
                              category: e.target.value,
                            })
                          }
                        />
                        <Button
                          onClick={handleSubmitCategory}
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          type="button"
                        >
                          Mainīt
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
                <form onSubmit={handleSubmitPrice}>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <FormHelperText style={{ color: "black" }}>
                        Cena uz 1 vienību
                      </FormHelperText>
                      <div className={classes.inputDiv}>
                        <InputBase
                          fullWidth
                          className={classes.inputBox}
                          type="text"
                          onFocus={(e) =>
                            e.target.addEventListener("input", handleRegEx)
                          }
                          onBlur={(e) =>
                            e.target.removeEventListener("input", handleRegEx)
                          }
                          label="Cena uz 1 vienību"
                          name="price"
                          value={dialog.price}
                          onChange={(e) =>
                            setDialog({
                              ...dialog,
                              price: e.target.value,
                            })
                          }
                          startAdornment={
                            <InputAdornment position="start">€</InputAdornment>
                          }
                        />
                        <Button
                          onClick={handleSubmitPrice}
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          type="button"
                        >
                          Mainīt
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Paper className={classes.paper} elevation={0} square>
            {elm[0]}
            <form onSubmit={handleSubmitAmount.bind(this, elm[0], key)}>
              <Input
                value={newAmount[key] === undefined ? 1 : newAmount[key]}
                onChange={(e) => {
                  const _newAmount = [...newAmount];
                  _newAmount[key] = e.target.value;
                  setNewAmount(_newAmount);
                }}
                endAdornment={
                  <InputAdornment position="end">{elm[1].type}</InputAdornment>
                }
                aria-describedby="standard-weight-helper-text"
                inputProps={{
                  "aria-label": "weight",
                }}
              />
            </form>
          </Paper>
          <div className={classes.amountBtns}>
            <IconButton onClick={handleChangeAmount.bind(this, 1, elm[0])}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton onClick={handleChangeAmount.bind(this, -1, elm[0])}>
              <ArrowDownwardIcon />
            </IconButton>
          </div>
        </Grid>
      ))}
    </Fragment>
  );
}

export default Items;
