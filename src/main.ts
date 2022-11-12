import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetifyApp = createVuetify({
   defaults: {
      global: { hideDetails: true },
      VCard: { elevation: 3 }
   }
});

const app = createApp(App)
app.use(vuetifyApp)
app.use(router)
app.mount('#app')
