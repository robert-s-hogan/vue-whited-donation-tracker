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

    const backendUrl =
      process.env.VUE_APP_BACKEND_URL || "http://localhost:8001";

    const fetchProgress = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/donations/progress`);
        const data = await response.json();
        progress.value = data.totalRaised;
        console.log("Updated progress:", data.totalRaised);
      } catch (error) {
        console.error("Error fetching donation progress:", error);
      }
    };

    const progressPercentage = computed(() => {
      return ((progress.value / goal) * 100).toFixed(2);
    });

    // In case 'data' and 'actions' are used in the future, but not yet, disable the ESLint warning:
    // eslint-disable-next-line no-unused-vars
    const unusedVariable = null;

    onMounted(() => {
      fetchProgress();

      paypal
        .Buttons({
          // eslint-disable-next-line no-unused-vars
          createOrder: async (data, actions) => {
            const response = await fetch(
              `${backendUrl}/api/paypal/create-order`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount: "10.00" }), // Example amount
              }
            );
            const order = await response.json();
            return order.id;
          },
          // eslint-disable-next-line no-unused-vars
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            console.log("Donation successful:", order);

            // Fetch updated progress after successful payment
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
