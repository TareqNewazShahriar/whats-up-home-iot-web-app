<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

useRouter().push({ name: 'home' });
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
