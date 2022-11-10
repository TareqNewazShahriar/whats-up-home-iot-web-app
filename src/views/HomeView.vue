<script setup>
import { reactive, onMounted } from 'vue';
import { firestoreService, DB } from '@/services/firestoreService';

const DATA_INTERVAL = 5 * 60 * 1000;

const machineData = reactive({
   thermistor: {},
   photoresistor: {},
   photoresistorStatus: [],
   bulbControlMode: null,
   bulbState: null,
   time: null,
   piHealthData: {}
});

const logData = reactive([]);

onMounted(() => {
   firestoreService.attachListenerOnDocument(
      DB.Collections.values,
      'machine-data',
      true,
      data => {
         data.bulbState = Boolean(data.bulbState);
         Object.assign(machineData, data);
         log({ message: `Received '${data.id}' response.`, parent_pid: data.node_parent_pid, pid: data.node_pid });
      },
      log);

   setInterval(
      (function clientDataRequest() {
         firestoreService.update(DB.Collections.values, 'machine-data-request', { value: new Date() }).catch(log);
         logData.push(`[${new Date().toUTCString()}] Machine data request sent.`)
         
         setTimeout(() => {
            logData.push(`[${new Date().toUTCString()}] Warn: Didn't get any response from Raspberry PI.`)
         }, 3000);

         return clientDataRequest;
      })(),
      DATA_INTERVAL);
});

function changeBulbControlMode(e) {
   if (confirm('Change bulb control mode?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-control-mode__from-client', { value: machineData.bulbControlMode }).catch(log);
   }
   else {
      e.preventDefault();
   }
}

function changeBulbState(e) {
   if (confirm('Change bulb state?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-state__from-client', { value: Number(machineData.bulbState) }).catch(log);
   }
   else {
      e.preventDefault();
      return false;
   }
}

function commandToReboot() {
   if (confirm('Confirm reboot?') == true) {
      firestoreService.update(DB.Collections.values, 'reboot__from-client', { value: new Date() }).catch(log);
   }
}

function log(data) {
   data.browser = navigator.userAgent;
   logData.push(`[${new Date().toJSON()}] ${JSON.stringify(data)}`);

   firestoreService.create(DB.Collections.logs, data, new Date().toJSON())
      .catch(error => { logData.push(`[${new Date().toJSON()}] ${JSON.stringify(error)}`); });
}

Error.prototype.toJsonString = function () {
   return JSON.stringify(this, Object.getOwnPropertyNames(this));
}
</script>

<template>
   <div>
      <h1>Whats Up Home IoT - Client App</h1>
      <div class="card-list my-8">
         <v-card class="elevation-5">
            <v-card-item>
               <v-card-title>Environment</v-card-title>
            </v-card-item>
            <v-card-text>
               <div>
                  <strong>Room Temperature</strong>
                  {{ machineData.thermistor.success ? machineData.thermistor.value.toString() : null }}
               </div>
               <div class="d-flex">
                  <strong class="text-no-wrap mr-2">Room Light<br/>Condition</strong>
                  <span>{{ machineData.photoresistor.success ? machineData.photoresistor.value : null }}
                     <br />
                     <div class="mt-2">[Hint: {{ machineData.photoresistorStatus }}]</div>
                  </span>
               </div>
               <div class="mt-4 d-inline-flex">
                  <strong>Bulb Control Mode</strong>
                  <v-radio-group color="primary" inline v-model="machineData.bulbControlMode" hide-details>
                     <v-radio label="Sensor" :value="1"></v-radio>
                     <v-radio label="Manual" :value="2"></v-radio>
                  </v-radio-group>
               </div>
               <div>
                  <strong>Bulb State</strong>
                  <v-switch hide-details color="primary" v-model="machineData.bulbState" @change="changeBulbState"></v-switch>
               </div>
            </v-card-text>
         </v-card>

         <v-card class="elevation-5">
            <v-card-item>
               <v-card-title>PI Health</v-card-title>
            </v-card-item>
            <v-card-text style="overflow: auto; max-height:300px;">
               <pre v-html="machineData.piHealthData.value"></pre>
            </v-card-text>
         </v-card>

         <v-card class="elevation-5">
            <v-card-item>
               <v-card-title>Misc</v-card-title>
            </v-card-item>
            <v-card-text>
               <div>
                  <strong>Last checked</strong>
                  {{ machineData.time ? machineData.time.toUTCString() : null }}
               </div>
               <div class="mt-5">
                  <v-btn variant="tonal" @click="commandToReboot">Reboot Raspberry Pi</v-btn>
               </div>
            </v-card-text>
         </v-card>

         <v-card class="console elevation-5">
            <v-card-item>
               <v-card-title>Console</v-card-title>
            </v-card-item>
            <v-card-text style="overflow: auto; max-height:300px;">
               <pre>{{ logData }}</pre>
            </v-card-text>
         </v-card>
      </div>
   </div>
</template>

<style>
.card-list {
   display: grid;
   row-gap: 30px;
}

@media (min-width: 600px) {
   .card-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px 30px;
   }
}
.console {
   background-color: black;
   border: inset black;
   bottom: 0;
   color: whitesmoke;
   padding: 5px;
   overflow: auto;
}
</style>
