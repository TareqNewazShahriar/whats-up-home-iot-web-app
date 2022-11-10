<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
   <v-app>
      <header>
         <nav v-if="false">
            <RouterLink to="/">Home</RouterLink>
         </nav>
      </header>
      <v-main :class="$vuetify.display.xs? 'ma-2' : 'ma-7'">
         <RouterView></RouterView>
      </v-main>
   </v-app>
</template>
