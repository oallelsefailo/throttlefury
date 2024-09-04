const express = require("express");
const app = express();
const firebaseAdmin = require("firebase-admin");
const itemRoutes = require("./routes/itemRoutes");

// Firebase initialization
const serviceAccount = require("./config/firebaseServiceAccount.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

app.use(express.json());
app.use("/api/items", itemRoutes); // Route for handling item contributions

app.listen(5000, () => console.log("Server running on port 5000"));
