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

<script>
/* global paypal */
import { ref, computed, onMounted } from "vue";

export default {
  setup() {
    const goal = 1000; // Example goal amount in USD
    const progress = ref(0);

    const backendUrl = process.env.VUE_APP_BACKEND_URL;
    console.log("Backend URL:", backendUrl); // Should print the correct URL
    const fetchProgress = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/donations/progress`);
        const data = await response.json();
        progress.value = data.totalRaised;
      } catch (error) {
        console.error("Error fetching donation progress:", error);
      }
    };

    const progressPercentage = computed(() => {
      return ((progress.value / goal) * 100).toFixed(2);
    });

    onMounted(() => {
      fetchProgress();

      paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // Set the amount for the donation
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            await actions.order.capture();
            // Fetch progress again after a successful payment
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
