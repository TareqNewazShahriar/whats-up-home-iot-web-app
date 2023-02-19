<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { firestoreService } from '@/services/firestoreService'
import { onMounted } from 'vue';

function signin() {
   firestoreService.googleSignIn().then(() => {}).catch(console.log);
}

onMounted(() => {
   firestoreService.checkForRedirectSignIn().then().catch();
});
</script>

<template>
   <v-app :class="$vuetify.display.xs? 'pa-2' : 'pa-7'">
      <header>
         <h1>Home IoT (Web App)</h1>
         <nav v-if="false">
            <RouterLink to="/">Home</RouterLink>
         </nav>
      </header>
      <hr class="my-5" style="color: silver;">
      <v-main>
         <RouterView></RouterView>
      </v-main>
      <hr class="my-5" style="color: silver;">
      <footer>
         <v-btn icon="mdi-shield-home" variant="flat" @click="signin"></v-btn>
      </footer>
   </v-app>
</template>
