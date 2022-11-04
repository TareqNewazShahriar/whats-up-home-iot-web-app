<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

useRouter().push({name:'home'});
</script>

<template>
   <v-app class="lalala">
      <header>
         <v-system-bar v-if="$vuetify.display.xs">
            <v-icon icon="mdi-wifi-strength-4"></v-icon>
            <v-icon icon="mdi-signal" class="ml-2"></v-icon>
            <v-icon icon="mdi-battery" class="ml-2"></v-icon>
            <span class="ml-2">{{ `${new Date().getHours()}:${new Date().getMinutes()}` }}</span>
         </v-system-bar>

         <div class="wrapper" v-if="false">
            <nav>
               <RouterLink to="/">Home</RouterLink>
            </nav>
         </div>
      </header>
      <v-main>
         <RouterView></RouterView>
      </v-main>
   </v-app>
</template>
