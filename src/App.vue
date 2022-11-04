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

<style scoped>
header {
   line-height: 1.5;
   max-height: 100vh;
}

.logo {
   display: block;
   margin: 0 auto 2rem;
}

nav {
   width: 100%;
   font-size: 12px;
   text-align: center;
   margin-top: 2rem;
}

nav a.router-link-exact-active {
   color: var(--color-text);
}

nav a.router-link-exact-active:hover {
   background-color: transparent;
}

nav a {
   display: inline-block;
   padding: 0 1rem;
   border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
   border: 0;
}
</style>
