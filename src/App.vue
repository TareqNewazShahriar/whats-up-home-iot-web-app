<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { firestoreService } from '@/services/firestoreService'
import { onMounted } from 'vue';
import { ref } from 'vue';

const userDisplayName = ref('');

onMounted(() => {
   firestoreService.registerAuthStateChanged((user:any)=> {
         userDisplayName.value = (user ? user.displayName : '');
         console.log({from: 'registerAuthStateChanged', user})
      },
      true,
      'App.vue > onMounted');

   firestoreService.checkForRedirectSignIn()
      .then(result => console.log({ from: 'checkForRedirectSignIn > then', result}))
      .catch(errorData => console.log({ from: 'checkForRedirectSignIn > catch', errorData}));
});

function signinToGoogle() {
   firestoreService.googleSignIn().then(() => {}).catch(console.log);
}
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
         <v-btn icon="mdi-shield-home" @click="signinToGoogle" :disabled="!!userDisplayName"></v-btn>
         <label class="ml-2">{{ userDisplayName }}</label>
      </footer>
   </v-app>
</template>
