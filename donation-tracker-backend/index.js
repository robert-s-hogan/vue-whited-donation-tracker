const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

let totalRaised = 0;

app.post("/webhook", (req, res) => {
  const event = req.body;

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const donationAmount = parseFloat(event.resource.amount.value);
    totalRaised += donationAmount;
    console.log(
      `Donation received: $${donationAmount}. Total raised: $${totalRaised}`
    );
  }

  res.status(200).send("OK");
});

app.get("/api/donations/progress", (req, res) => {
  res.json({ totalRaised });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
