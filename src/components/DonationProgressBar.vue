<template>
  <div class="relative mb-6 z-10">
    <!-- Background Bar -->
    <div class="h-4 bg-gray-300 rounded-full overflow-visible relative">
      <!-- Progress Fill -->
      <div
        v-if="donationStore.progressPercentage"
        :style="{ width: donationStore.progressPercentage + '%' }"
        class="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
      ></div>

      <!-- Goal Markers -->
      <div
        v-for="(goal, index) in donationStore.goals"
        :key="goal.name"
        class="marker absolute top-0"
        :style="{ left: calculateGoalPosition(goal) + '%' }"
      >
        <!-- CustomPopover Component -->
        <CustomPopover :position="index % 2 === 0 ? 'below' : 'above'">
          <!-- Trigger Slot -->
          <template #trigger>
            <div
              class="h-4 w-4 bg-gray-600 rounded-full cursor-pointer group-hover:bg-green-600 transform -translate-x-1/2"
            ></div>
          </template>

          <!-- Content Slot -->
          <template #content>
            <div class="font-bold">{{ goal.name }}</div>
            <div>Target: ${{ goal.target }}</div>
            <!-- Additional content for Custompopover -->
            <div class="mt-2">
              <a href="#" class="text-blue-500 underline">Learn More</a>
            </div>
          </template>
        </CustomPopover>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CustomPopover from "./CustomPopover.vue"; // Import the reusable CustomPopover component
import { useDonationStore } from "../stores/useDonationStore"; // Import the Pinia store

export default defineComponent({
  components: {
    CustomPopover, // Register the CustomPopover component
  },
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

    return {
      donationStore,
      calculateGoalPosition,
    };
  },
});
</script>
