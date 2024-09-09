<template>
  <div class="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
      Whited Donation Tracker
    </h2>

    <!-- Thermometer Progress Bar -->
    <div class="relative mb-6">
      <!-- Background Bar -->
      <div class="h-4 bg-gray-300 rounded-full overflow-hidden relative">
        <!-- Progress Fill -->
        <div
          v-if="donationStore.progressPercentage"
          :style="{ width: donationStore.progressPercentage + '%' }"
          class="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
        ></div>

        <!-- Goal Markers -->
        <div
          v-for="goal in donationStore.goals"
          :key="goal.name"
          class="marker relative group"
          :style="{ left: calculateGoalPosition(goal) + '%' }"
        >
          <!-- Marker Circle -->
          <div
            class="h-4 w-4 bg-gray-600 rounded-full cursor-pointer hover:bg-green-600"
            :style="{ transform: 'translateX(-50%)' }"
          ></div>

          <!-- Popover (Shows on Hover) -->
          <div
            class="popover absolute bottom-[150%] left-1/2 transform -translate-x-1/2 p-2 bg-white text-sm shadow-lg rounded-lg opacity-0 group-hover:opacity-100"
          >
            <div class="font-bold">{{ goal.name }}</div>
            <div>Target: ${{ goal.target }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Raised and Goal -->
    <div class="flex justify-between text-sm text-gray-700 mt-2">
      <span>Total Raised: ${{ donationStore.totalRaised }}</span>
      <span>Goal: ${{ donationStore.combinedGoalTarget }}</span>
    </div>

    <!-- Total Donations Display -->
    <div class="text-right text-sm text-gray-700 mb-6">
      <strong>Total Donations:</strong> {{ donationStore.totalDonations }}
    </div>

    <!-- PayPal Button Container -->
    <div id="paypal-button-container" class="mt-6"></div>
  </div>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { useDonationStore } from "../stores/useDonationStore"; // Import the Pinia store

export default {
  setup() {
    const donationStore = useDonationStore(); // Access the store

    // Function to calculate the position of each goal on the progress bar
    const calculateGoalPosition = (goal: { target: number }) => {
      const combinedGoalTarget = donationStore.combinedGoalTarget;
      if (combinedGoalTarget === 0) {
        return 0; // No position if there is no combined goal
      }
      return ((goal.target / combinedGoalTarget) * 100).toFixed(2); // Calculate percentage position
    };

    onMounted(() => {
      donationStore.fetchProgress(); // Fetch donation progress when the component mounts

      paypal
        .Buttons({
          createOrder: (data: unknown, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // Example donation amount
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
      calculateGoalPosition,
    };
  },
};
</script>

<style scoped>
.popover {
  transition: opacity 0.3s ease;
  opacity: 0;
  z-index: 10;
}

.group:hover .popover {
  opacity: 1; /* Show popover on hover */
}

.marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
