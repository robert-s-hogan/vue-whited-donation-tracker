import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Define the structure of each goal
interface Goal {
  name: string;
  target: number;
}

export const useDonationStore = defineStore("donationStore", () => {
  // State
  const totalRaised = ref<number>(0); // Track totalRaised
  const totalDonations = ref<number>(0); // Track totalDonations
  const goals = ref<Goal[]>([]); // Track the list of goals

  // Actions
  const fetchProgress = async () => {
    try {
      const donationsRef = doc(db, "donations", "progress");
      const docSnapshot = await getDoc(donationsRef);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        console.log("Fetched Firestore Data:", data); // Debugging purposes

        // Sort goals by target (ascending)
        goals.value = (data.goals || []).sort((a: Goal, b: Goal) => {
          return (a.target || 0) - (b.target || 0); // Sort by target
        });

        totalRaised.value = data.totalRaised || 0;
        totalDonations.value = data.totalDonations || 0;
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching donation progress:", error);
    }
  };

  const handleDonationSuccess = async (order: any) => {
    const donationAmount = parseFloat(order.purchase_units[0].amount.value);

    const donationsRef = doc(db, "donations", "progress");
    const docSnapshot = await getDoc(donationsRef);

    if (docSnapshot.exists()) {
      const currentTotal = docSnapshot.data().totalRaised || 0;
      const currentDonations = docSnapshot.data().totalDonations || 0;

      await updateDoc(donationsRef, {
        totalRaised: currentTotal + donationAmount,
        totalDonations: currentDonations + 1,
      });
    } else {
      await setDoc(donationsRef, {
        totalRaised: donationAmount,
        totalDonations: 1, // First donation
        goals: goals.value, // Use the current goals array
      });
    }

    fetchProgress(); // Refresh the data
  };

  // Computed properties
  const combinedGoalTarget = computed(() => {
    if (goals.value.length === 0) {
      return 0;
    }
    return goals.value.reduce((sum, goal) => sum + (goal.target || 0), 0); // Sum the target values of all goals
  });

  const progressPercentage = computed(() => {
    if (combinedGoalTarget.value === 0) {
      return 0;
    }
    return ((totalRaised.value / combinedGoalTarget.value) * 100).toFixed(2);
  });

  return {
    totalRaised,
    totalDonations,
    goals,
    combinedGoalTarget,
    progressPercentage,
    fetchProgress,
    handleDonationSuccess,
  };
});
