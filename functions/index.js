const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const serviceAccountBackup = require("./kro-backup-key.json");
const { google } = require("googleapis");
const cors = require("cors");
const express = require("express");
admin.initializeApp({
  apiKey: "AIzaSyBydKTwKKW9fazXdOhyOo6LA_P1KXFQ1FQ",
  authDomain: "kro-wearhouse-tracker.firebaseapp.com",
  databaseURL:
    "https://kro-wearhouse-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kro-wearhouse-tracker",
  storageBucket: "kro-wearhouse-tracker.appspot.com",
  messagingSenderId: "1050192643523",
  appId: "1:1050192643523:web:e91826b890b2b5102e2976",
});
const db = admin.firestore();
const rtdb = admin.database();

const app = express();
app.use(cors({ origin: true }));

const authClient = new google.auth.JWT({
  email: serviceAccountBackup.client_email,
  key: serviceAccountBackup.private_key,
  scopes: [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});

const firestoreClient = google.firestore({
  version: "v1beta2",
  auth: authClient,
});

app.post("/getReceipts", async (req, res) => {
  var columns = [{ selector: "date", name: "Datums" }];

  const database = req.body.db;
  const limit = req.body.limit;

  var receiptData = [];
  var tableData = [];
  var id = 1;

  const querySnapshotReceipts = await db
    .collection("receipts")
    .where("database", "==", database)
    .orderBy("date", "desc")
    .limit(limit)
    .get();

  var lastElm = null;
  var totalWeekCost = 0;

  querySnapshotReceipts.forEach((doc) => {
    const items = doc.data().items;
    const docId = doc.id;
    var totalDayCost = 0;
    if (items.length !== undefined) {
      receiptData.push({
        id: id,
        date: docId.replace(`_${database}`, ""),
      });

      items.forEach((item) => {
        totalDayCost += item.cost;

        receiptData[id - 1][item.itemName] =
          (item.amountDelta < 0
            ? item.amountDelta
            : item.amountDelta === 0
            ? item.amountDelta
            : `+${item.amountDelta}`) +
          " " +
          item.type +
          ", " +
          item.cost +
          "€";
        tableData.indexOf(item.itemName) === -1 &&
          tableData.push(item.itemName);
      });
      totalWeekCost += Math.round((totalDayCost + Number.EPSILON) * 100) / 100;

      receiptData[id - 1].total =
        Math.round((totalDayCost + Number.EPSILON) * 100) / 100 + "€";
      id++;
    } else {
      if (docId.includes("**")) {
        // Last doc
        receiptData.push({
          id: id,
          date: docId.replace(`_${database}`, ""),
          ...items,
        });
        id++;
      } else {
        // First doc
        totalWeekCost = 0;
        lastElm = null;
        receiptData.push({
          id: id,
          date: docId.replace(`_${database}`, ""),
          ...items,
        });
        id++;
      }
    }

    if (lastElm) {
      lastElm.total =
        Math.round((totalWeekCost + Number.EPSILON) * 100) / 100 + "€";
    } else {
      var _lastElm = receiptData.find(
        ({ date }) => date === docId.replace(`_${database}`, "**")
      );
      if (_lastElm) {
        _lastElm.total =
          Math.round((totalWeekCost + Number.EPSILON) * 100) / 100 + "€";
        lastElm = _lastElm;
      }
    }
  });

  tableData.push("total");
  tableData.forEach((item) => {
    columns.push({
      selector: item,
      name: item,
      width: 150,
    });
  });
  return res.json({ columns: columns, rows: receiptData });
});

exports.api = functions.region("europe-west3").https.onRequest(app);

exports.morningWrite = functions
  .region("europe-west3")
  .pubsub.schedule("0 7 * * *")
  .timeZone("Europe/Riga")
  .onRun(() => {
    let dateObj = new Date();
    let dateObjYesterday = new Date();

    let month = dateObj.getUTCMonth() + 1;
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();

    dateObjYesterday.setDate(dateObjYesterday.getDate() - 1);
    let monthYesterday = dateObjYesterday.getUTCMonth() + 1;
    let dayYesterday = dateObjYesterday.getUTCDate();
    let yearYesterday = dateObjYesterday.getUTCFullYear();

    const newdate = day + "." + month + "." + year + "_start";
    const lastDate =
      dayYesterday + "." + monthYesterday + "." + yearYesterday + "_start";

    rtdb.ref().once("value", async (data) => {
      data.forEach((database) => {
        console.log("Starting evening write for: " + databaseName.key);
        var finalItems = {};
        const items = database.val().items;
        for (const i in items) {
          const _items = items[i];
          for (const j in _items) {
            finalItems[j] = _items[j].amount;
          }
        }
        db.doc(`data/${newdate}_${database.key}/`).set({
          database: database.key,
          date: admin.firestore.FieldValue.serverTimestamp(),
          items: finalItems,
        });
        console.log("Morning: Set: " + `data/${newdate}_${database.key}/`);
        db.doc(`data/${lastDate}_${database.key}/`).delete();
        console.log("Morning: Deleted: " + `data/${lastDate}_${database.key}/`);
      });
    });
    return null;
  });

exports.eveningWrite = functions
  .region("europe-west3")
  .pubsub.schedule("0 22 * * *")
  .timeZone("Europe/Riga")
  .onRun(() => {
    let dateObj = new Date();
    let dateObjYesterday = new Date();

    let month = dateObj.getUTCMonth() + 1;
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();

    dateObjYesterday.setDate(dateObjYesterday.getDate() - 1);
    let monthYesterday = dateObjYesterday.getUTCMonth() + 1;
    let dayYesterday = dateObjYesterday.getUTCDate();
    let yearYesterday = dateObjYesterday.getUTCFullYear();

    const newdate = day + "." + month + "." + year;
    const lastDate = dayYesterday + "." + monthYesterday + "." + yearYesterday;

    function getDayName(dateStr, locale) {
      var date = new Date(dateStr);
      return date.toLocaleDateString(locale, { weekday: "long" });
    }
    var isMonday =
      getDayName(month + "/" + day + "/" + year, "lv-LV") === "Pirmdiena";

    rtdb.ref().once("value", async (data) => {
      data.forEach((database) => {
        const databaseName = database.key;
        console.log("Starting evening write for: " + databaseName);
        var itemsEnd = {};
        var itemsStart = {};
        var totalItems = {};
        var finalItems = [];

        const items = database.val().items;
        for (const i in items) {
          const _items = items[i];
          for (const j in _items) {
            totalItems[j] = _items[j];
            itemsEnd[j] = _items[j].amount;
          }
        }
        db.doc(`data/${newdate}_end_${databaseName}/`)
          .set({
            database: databaseName,
            date: admin.firestore.FieldValue.serverTimestamp(),
            items: itemsEnd,
          })
          .then(() => {
            console.log(
              "Evening: Set: " + `data/${newdate}_end_${databaseName}/`
            );
            db.doc(`data/${lastDate}_end_${databaseName}/`).delete();
          })
          .then(() => {
            console.log(
              "Evening: Delete: " + `data/${lastDate}_end_${databaseName}/`
            );
            // BEIDZAS DATA POPULATION, SAKAS RECEIPT POPULATION
            return db.doc(`data/${newdate}_start_${databaseName}`).get();
          })
          .then((docStart) => {
            if (isMonday) {
              db.doc(`receipts/${newdate}_${databaseName}*`).set(
                docStart.data()
              );
              console.log(
                "Evening: Monday Set: " + `receipts/${newdate}_${databaseName}*`
              );
            }
            itemsStart = docStart.data().items;
            Object.keys(itemsEnd).forEach((key) => {
              const itemEndAmount = itemsEnd[key];
              const itemStartAmount = itemsStart[key];
              const currentItemData = totalItems[key];

              if (
                itemStartAmount !== undefined &&
                currentItemData !== undefined
              ) {
                var result = itemStartAmount - itemEndAmount;
                result *= -1;
                finalItems.push({
                  itemName: key,
                  type: currentItemData.type,
                  pricePerUnit: currentItemData.price,
                  amountDelta: result,
                  cost: result < 0 ? currentItemData.price * result : 0,
                });
              }
            });
            db.doc(`receipts/${newdate}_${databaseName}`).set({
              database: databaseName,
              date: admin.firestore.FieldValue.serverTimestamp(),
              items: finalItems,
            });
            console.log(
              "Evening: Set: " + `receipts/${newdate}_${databaseName}`
            );
            db.doc(`receipts/${newdate}_${databaseName}**`).set({
              database: databaseName,
              date: admin.firestore.FieldValue.serverTimestamp(),
              items: itemsEnd,
            });
            console.log(
              "Evening: Set: " + `receipts/${newdate}_${databaseName}`
            );
            if (!isMonday) {
              db.doc(`receipts/${lastDate}_${databaseName}**`).delete();
              console.log(
                "Evening: Delete: " + `receipts/${lastDate}_${databaseName}**`
              );
            }
          });
      });
    });
    return null;
  });

exports.backupFirestore = functions
  .region("europe-west3")
  .pubsub.schedule("every day 22:30")
  .timeZone("Europe/Riga")
  .onRun(async (context) => {
    const projectId = "kro-wearhouse-tracker";

    const timestamp = new Date().toISOString();

    console.log(`Start to backup project ${projectId}`);

    await authClient.authorize();
    return firestoreClient.projects.databases.exportDocuments({
      name: `projects/${projectId}/databases/(default)`,
      requestBody: {
        outputUriPrefix: `gs://${projectId}-firestore-backup/backups/${timestamp}`,
      },
    });
  });
