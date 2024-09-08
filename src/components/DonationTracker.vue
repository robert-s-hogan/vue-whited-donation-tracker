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
          class="bg-gradient-to-t from-green-500 to-green-200 absolute bottom-0 left-0 right-0 rounded-full transition-transform duration-500 ease-out"
        ></div>
        <!-- Milestone marker at 50% -->
        <div
          class="absolute w-full text-center bottom-[50%] transform translate-y-1/2 text-gray-600 font-bold text-sm"
        >
          50%
        </div>
      </div>
    </div>

    <!-- Horizontal Progress Bar -->
    <div class="h-4 bg-gray-300 rounded-full overflow-hidden mb-6">
      <div
        :style="{ width: progressPercentage + '%' }"
        class="bg-green-500 h-full rounded-full transition-all duration-500 ease-in-out"
      ></div>
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

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
    >
      <strong class="font-bold">Success!</strong>
      <span class="block sm:inline">Thank you for your donation!</span>
    </div>

    <!-- PayPal Button Container -->
    <div id="paypal-button-container" class="mt-6"></div>
  </div>
</template>

<script lang="ts">
/* global paypal */
import { ref, computed, onMounted } from "vue";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"; // Firebase Firestore imports
import { db } from "../firebaseConfig"; // Ensure this points to your firebaseConfig file

export default {
  setup() {
    const goal = 1000; // Example goal amount in USD
    const progress = ref(0); // Track current donation progress
    const showSuccess = ref(false); // Manage success message state

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
      return ((progress.value / goal) * 100).toFixed(2); // Calculate progress percentage
    });

    const handleDonationSuccess = async (order: any) => {
      const donationAmount = parseFloat(order.purchase_units[0].amount.value); // Get donation amount

      // Update Firestore with new donation
      const donationsRef = doc(db, "donations", "progress");
      const docSnapshot = await getDoc(donationsRef);

      if (docSnapshot.exists()) {
        const currentTotal = docSnapshot.data().totalRaised || 0;
        await updateDoc(donationsRef, {
          totalRaised: currentTotal + donationAmount,
        });
      } else {
        await setDoc(donationsRef, {
          totalRaised: donationAmount,
        });
      }

      fetchProgress(); // Refresh progress data after donation

      // Show success message for 3 seconds
      showSuccess.value = true;
      setTimeout(() => {
        showSuccess.value = false;
      }, 3000);
    };

    onMounted(() => {
      fetchProgress(); // Fetch progress when component mounts

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
            handleDonationSuccess(order); // Call success handler after donation
          },
        })
        .render("#paypal-button-container");
    });

    return {
      goal,
      progress,
      progressPercentage,
      showSuccess,
    };
  },
};
</script>

<style scoped>
/* Optional styling for success message bounce effect */
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animated-bounce {
  animation: bounce 0.5s ease-in-out;
}
</style>
