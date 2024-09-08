import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Retrieve PayPal Webhook ID from environment variables
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Verify the PayPal Webhook Signature
function verifySignature(
  req: any, // Use 'any' type since we're not using express in v2
  webhookId: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", webhookId)
    .update(req.rawBody)
    .digest("base64");

  // Explicitly cast req.headers["paypal-signature"] to string
  return (req.headers["paypal-signature"] as string) === expectedSignature;
}

// PayPal Webhook Function
export const paypalWebhook = onRequest(
  async (
    req: any, // Use 'any' type since we're not using express in v2
    res: any
  ): Promise<void> => {
    // Check if the webhook ID is defined
    if (!PAYPAL_WEBHOOK_ID) {
      logger.error("PayPal Webhook ID is not set in environment variables");
      res
        .status(500)
        .send("Server configuration error: missing PayPal Webhook ID");
      return;
    }

    // Verify the webhook signature
    const signatureValid: boolean = verifySignature(req, PAYPAL_WEBHOOK_ID);

    if (!signatureValid) {
      logger.error("Invalid PayPal Webhook signature");
      res.status(400).send("Invalid PayPal Webhook signature");
      return; // End execution
    }

    const event = req.body;

    // Only handle successful payment capture events
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const amount = parseFloat(event.resource.amount.value);

      const donationsRef = db.collection("donations").doc("progress");
      const docSnapshot = await donationsRef.get();

      if (docSnapshot.exists) {
        const currentTotal = docSnapshot.data()?.totalRaised || 0;
        await donationsRef.update({
          totalRaised: currentTotal + amount,
        });
      } else {
        await donationsRef.set({
          totalRaised: amount,
        });
      }
      logger.info("Donation successfully captured and stored.");
    }

    res.status(200).send("Webhook handled successfully");
  }
);
