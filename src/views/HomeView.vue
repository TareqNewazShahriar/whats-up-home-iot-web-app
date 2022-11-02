<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
   <v-container class="fill-height">
      <v-responsive class="d-flex fill-height">
         <div class="cover-image d-flex" style="justify-content:space-between;">
            <div></div>
            <div class="d-flex flex-column justify-center pa-2" :style="$vuetify.display.xs ? 'width:80%' : 'width:50%'">
               <div class="d-flex align-center">
                  <span class="mr-2">Make</span>
                  <v-text-field hide-details :variant="$vuetify.display.xs ? 'filled' : 'outlined'" style="width:100%;" />
               </div>
               <div class=" d-flex align-center mt-3">
                  <span class="mr-2">Model</span>
                  <v-select hide-details :variant="$vuetify.display.xs ? 'filled' : 'outlined'" style="width:100%;" />
               </div>
               <v-btn :flat="!$vuetify.display.xs" color="primary" class="mt-3">Save</v-btn>
            </div>
         </div>
         <HelloWorld msg="You did it!" />
      </v-responsive>
   </v-container>
</template>

<style>
.cover-image {
   background: linear-gradient(rgba(206, 205, 205, 0.4), rgba(240, 239, 239, 0.4));
   background-position: center center;
   background-repeat: no-repeat;
   background-size: cover;
   height: 250px;
}
</style>
