<template>
  <div class="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg relative z-10">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
      Whited Donation Tracker
    </h2>

    <!-- Use the Donation Progress Bar component -->
    <DonationProgressBar
      :goals="donationStore.goals"
      :totalRaised="donationStore.totalRaised"
      :combinedGoalTarget="donationStore.combinedGoalTarget"
    />

    <!-- Total Raised and Goal -->
    <div class="flex justify-between text-sm text-gray-700 mt-2 mb-6">
      <span>Total Raised: ${{ donationStore.totalRaised }}</span>
      <span>Goal: ${{ donationStore.combinedGoalTarget }}</span>
    </div>

    <!-- Donation Options -->
    <div class="text-center mb-4">
      <h3 class="font-semibold text-lg mb-2">Choose Donation Amount</h3>

      <!-- Preset Buttons -->
      <div class="flex justify-center space-x-2 mb-4">
        <button
          v-for="amount in presetAmounts"
          :key="amount"
          @click="setPresetAmount(amount)"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
        >
          ${{ amount }}
        </button>
      </div>

      <!-- Custom Slider -->
      <div class="mb-4">
        <label for="donationSlider" class="block font-medium mb-1"
          >Custom Donation:</label
        >
        <input
          type="range"
          id="donationSlider"
          min="1"
          max="100"
          step="1"
          v-model="sliderValue"
          class="w-full"
        />
        <p class="mt-2">Selected Amount: ${{ sliderValue }}</p>
      </div>
    </div>

    <!-- Display Selected Donation -->
    <div class="text-center text-lg font-bold mb-6">
      You are donating: ${{ selectedAmount }}
    </div>

    <!-- PayPal Button Container -->
    <div id="paypal-button-container" class="mt-6"></div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue";
import DonationProgressBar from "./DonationProgressBar.vue"; // Import the progress bar component
import { useDonationStore } from "../stores/useDonationStore"; // Import the Pinia store

export default {
  components: {
    DonationProgressBar, // Register the component
  },
  setup() {
    const donationStore = useDonationStore(); // Access the store

    // State for donation amounts
    const presetAmounts = [10, 25, 50, 100];
    const sliderValue = ref<number>(10); // Default slider value
    const selectedAmount = ref<number>(10); // Default selected donation

    // Function to set the donation amount from preset buttons
    const setPresetAmount = (amount: number) => {
      if (amount > 0) {
        selectedAmount.value = amount;
        sliderValue.value = amount; // Synchronize slider with preset button
      }
    };

    // Watch the sliderValue and automatically update the selectedAmount
    watch(sliderValue, (newValue: number) => {
      selectedAmount.value = newValue; // Keep selectedAmount and sliderValue synchronized
    });

    onMounted(() => {
      donationStore.fetchProgress(); // Fetch donation progress when the component mounts

      paypal
        .Buttons({
          createOrder: (data: unknown, actions: any) => {
            // Ensure selectedAmount is a number
            const donationAmount = Number(selectedAmount.value);

            if (isNaN(donationAmount)) {
              throw new Error("Invalid donation amount");
            }

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: donationAmount.toFixed(2), // Safely call toFixed on a number
                  },
                },
              ],
            });
          },
          onApprove: async (data: unknown, actions: any) => {
            const order = await actions.order.capture();
            console.log("Donation successful:", order);
            donationStore.handleDonationSuccess(order); // Handle donation success
          },
        })
        .render("#paypal-button-container");
    });

    return {
      donationStore,
      presetAmounts,
      sliderValue,
      selectedAmount,
      setPresetAmount,
    };
  },
};
</script>
