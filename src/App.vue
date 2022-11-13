<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
   <v-app :class="$vuetify.display.xs? 'pa-2' : 'pa-7'">
      <header>
         <h1>Whats Up Home IoT (Client)</h1>
         <nav v-if="false">
            <RouterLink to="/">Home</RouterLink>
         </nav>
      </header>
      <v-main>
         <RouterView></RouterView>
      </v-main>
   </v-app>
</template>
