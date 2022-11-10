import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetifyApp = createVuetify({
   theme: {
     themes: {
       light: {
         colors: {
           primary: '#1867C0',
           secondary: '#5CBBF6',
         },
       },
     },
   },
   defaults: {
      global: { hideDetails: true },
      VCard: { elevation: 3 }
   }
});

const app = createApp(App)
app.use(vuetifyApp)
app.use(router)
app.mount('#app')
