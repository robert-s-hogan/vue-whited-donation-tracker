<template>
  <div class="relative group">
    <!-- Trigger Element (Marker Circle) -->
    <slot name="trigger"></slot>

    <!-- Popover Content -->
    <div
      :class="{
        'absolute bottom-full': position === 'above', // Popover above
        'absolute top-full': position === 'below', // Popover below
      }"
      class="left-1/2 -translate-x-1/2 w-48 p-4 bg-white text-sm shadow-lg rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 ease-in-out z-[9999]"
    >
      <!-- Content Slot for Custom Content -->
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    position: {
      type: String as () => "above" | "below", // Popover position: 'above' or 'below'
      default: "above", // Default to popover above
    },
  },
});
</script>
