const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paypal = require("@paypal/checkout-server-sdk");

const admin = require("firebase-admin");
const serviceAccount = require("./config/firebaseServiceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Now access Firestore
const db = admin.firestore();
const donationsRef = db.collection("donations");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple in-memory store for donations
let totalRaised = 0;

// Configure the PayPal environment with your client ID and secret
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Function to create a PayPal order
async function createOrder(amount) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
      },
    ],
  });

  try {
    const order = await client.execute(request);
    return order.result;
  } catch (err) {
    console.error("PayPal Order Creation Error:", err.message);
    console.error("Details:", err.response);
    return null;
  }
}

// Basic route to test the server
app.get("/", (req, res) => {
  res.send("Hello from Node.js!");
});

app.post(
  "/api/paypal/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookEvent = req.body;

    try {
      // Verify the webhook signature
      const signatureVerification =
        new paypal.notification.WebhookEventVerifyRequest();
      signatureVerification.authAlgo = req.headers["paypal-auth-algo"];
      signatureVerification.certUrl = req.headers["paypal-cert-url"];
      signatureVerification.transmissionId =
        req.headers["paypal-transmission-id"];
      signatureVerification.transmissionSig =
        req.headers["paypal-transmission-sig"];
      signatureVerification.transmissionTime =
        req.headers["paypal-transmission-time"];
      signatureVerification.webhookId = process.env.PAYPAL_WEBHOOK_ID; // Set this in your .env
      signatureVerification.requestBody = req.body;

      const response = await client.execute(signatureVerification);

      if (response.statusCode === 200) {
        const event = webhookEvent.event_type;
        if (event === "CHECKOUT.ORDER.APPROVED") {
          const amount = parseFloat(
            webhookEvent.resource.purchase_units[0].amount.value
          );
          await donationsRef.add({
            amount,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Optionally, update the totalRaised variable or handle the logic to fetch the latest total.
          res.status(200).send("Webhook received successfully");
        } else {
          console.log("Unhandled event type:", event);
          res.status(200).send("Event type not handled");
        }
      } else {
        res.status(400).send("Invalid webhook signature");
      }
    } catch (error) {
      console.error("Error handling PayPal webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Update the donation logic to use Firestore
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await createOrder(amount);

    if (order) {
      await donationsRef.add({
        amount: parseFloat(amount),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json(order);
    } else {
      res.status(500).json({ error: "Failed to create order" });
    }
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.get("/api/donations/progress", async (req, res) => {
  try {
    const testDoc = await donationsRef.doc("testDoc").get();
    if (!testDoc.exists) {
      res.status(404).json({ error: "Document not found" });
    } else {
      res.status(200).json(testDoc.data());
    }
  } catch (error) {
    console.error("Firestore test error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/test-firestore", async (req, res) => {
  try {
    const testDoc = await donationsRef.doc("testDoc").get();
    res.status(200).json(testDoc.data());
  } catch (error) {
    console.error("Firestore test error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
