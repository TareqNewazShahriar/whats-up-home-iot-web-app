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
      <v-main>
         <RouterView></RouterView>
      </v-main>
   </v-app>
</template>
