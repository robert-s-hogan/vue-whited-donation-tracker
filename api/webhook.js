import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.resolve("./donations.json");

const loadDonations = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return { totalRaised: 0, donations: [] };
  }
};

const saveDonations = async (data) => {
  await fs.writeFile(dataFilePath, JSON.stringify(data));
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const event = req.body;

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const donationAmount = parseFloat(event.resource.amount.value);
      const newDonation = {
        id: event.resource.id,
        amount: donationAmount,
        timestamp: event.create_time,
      };

      let donationData = await loadDonations();
      donationData.totalRaised += donationAmount;
      donationData.donations.push(newDonation);

      await saveDonations(donationData);

      console.log(
        `Donation received: $${donationAmount}. Total raised: $${donationData.totalRaised}`
      );
    }

    res.status(200).send("OK");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
