<template>
  <div class="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
      Support Our School
    </h2>

    <!-- Thermometer Visualization -->
    <div class="flex items-center justify-center mb-8">
      <div class="w-12 bg-gray-200 rounded-full h-64 relative overflow-hidden">
        <div
          :style="{ height: progressPercentage + '%' }"
          class="bg-green-500 absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300 ease-in-out"
        ></div>
      </div>
    </div>

    <!-- Goal and Raised Amount -->
    <div class="flex justify-between mb-6">
      <div>
        <span
          class="text-sm font-semibold inline-block py-1 px-3 uppercase rounded-full text-white bg-green-500"
        >
          Goal: ${{ goal }}
        </span>
      </div>
      <div class="text-right text-sm text-gray-700">${{ progress }} raised</div>
    </div>

    <!-- PayPal Button Container -->
    <div id="paypal-button-container" class="mt-6"></div>
  </div>
</template>

<script lang="ts">
/* global paypal */
import { ref, computed, onMounted } from "vue";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore"; // Importing collection and getDocs correctly
import { db } from "../firebaseConfig"; // Ensure this points to your firebaseConfig file
import { QuerySnapshot, DocumentData } from "firebase/firestore";

export default {
  setup() {
    const goal = 1000; // Example goal amount in USD
    const progress = ref(0);

    const fetchProgress = async () => {
      try {
        const donationsRef = doc(db, "donations", "progress");
        const docSnapshot = await getDoc(donationsRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          progress.value = data.totalRaised || 0; // Safely retrieve totalRaised
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching donation progress:", error);
      }
    };

    const progressPercentage = computed(() => {
      return ((progress.value / goal) * 100).toFixed(2);
    });

    onMounted(() => {
      fetchProgress(); // Fetch initial progress when component mounts

      paypal
        .Buttons({
          createOrder: (data: unknown, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // The donation amount
                  },
                },
              ],
            });
          },
          onApprove: async (data: unknown, actions: any) => {
            const order = await actions.order.capture();
            console.log("Donation successful:", order);

            // Parse the order amount as a float to avoid NaN issues
            const donationAmount = parseFloat(
              order.purchase_units[0].amount.value
            );

            // Update Firestore directly with the donation amount
            const donationsRef = doc(db, "donations", "progress");

            const docSnapshot = await getDoc(donationsRef);
            if (docSnapshot.exists()) {
              const currentTotal = docSnapshot.data().totalRaised || 0; // Ensure currentTotal is not undefined
              await updateDoc(donationsRef, {
                totalRaised: currentTotal + donationAmount,
              });
            } else {
              await setDoc(donationsRef, {
                totalRaised: donationAmount,
              });
            }

            // Fetch the updated progress after a successful donation
            fetchProgress();
          },
        })
        .render("#paypal-button-container");
    });

    return {
      goal,
      progress,
      progressPercentage,
    };
  },
};
</script>
