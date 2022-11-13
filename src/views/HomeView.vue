<script setup>
import { reactive, ref, onMounted } from 'vue';
import { firestoreService, DB } from '@/services/firestoreService';

Error.prototype.toJsonString = function () {
   return JSON.stringify(this, Object.getOwnPropertyNames(this));
}

const DATA_INTERVAL = 5 * 60 * 1000;
var _requestedDataRef;

const machineData = reactive({
   thermistor: {},
   photoresistor: {},
   photoresistorStatus: [],
   bulbControlMode: null,
   bulbState: null,
   time: null,
   piHealthData: {}
});
const logData = ref([]);
const bulbControlModeRequested = ref(false);
const bulbStateRequested = ref(false);
const isPiAlive = ref(true);


function changeBulbControlMode(e) {
   if (confirm('Change bulb control mode?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-control-mode__from-client', { value: machineData.bulbControlMode }).catch(log);
      bulbControlModeRequested.value = true;
   }
   else {
      e.preventDefault();
      machineData.bulbControlMode = machineData.bulbControlMode === 1 ? 2 : 1; // revert the selection
   }
}

function changeBulbState(e) {
   log({message: `Changing bulbState. ${machineData.bulbState}`}, true);
   if (confirm('Change bulb state?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-state__from-client', { value: machineData.bulbState }).catch(log);
      bulbStateRequested.value = true;
   }
   else {
      e.preventDefault();
      machineData.bulbState = Number(!machineData.bulbState); // revert the selection
   }
}

function commandToReboot() {
   if (confirm('Confirm reboot?') == true) {
      firestoreService.update(DB.Collections.values, 'reboot__from-client', { value: new Date() }).catch(log);
   }
}

function log(data, skipStoring) {
   data.browser = navigator.userAgent;
   logData.value.push(`[${new Date().toJSON()}] ${JSON.stringify(data)}`);

   if(!skipStoring) {
      firestoreService.create(DB.Collections.logs, data, `${new Date().toJSON()}~`)
         .catch(error => { logData.value.push(`[${new Date().toJSON()}] ${JSON.stringify(error)}`); });
   }
}

function requestMachineData() {
   firestoreService.update(DB.Collections.values, 'machine-data-request', { value: new Date() }).catch(log);
   log({message: `Machine data request sent.`}, true);

   _requestedDataRef = setTimeout(() => {
      log({message: `Warn: Didn't get any response from Raspberry PI.`});
      isPiAlive.value = false;
   },
   3000);
}

onMounted(() => {
   firestoreService.attachListenerOnDocument(
      DB.Collections.values,
      'machine-data',
      true,
      data => {
         clearTimeout(_requestedDataRef);
         Object.assign(machineData, data);
         isPiAlive.value = true;
         log({message: 'Machine data response received.'}, true);
      },
      log);

   firestoreService.attachListenerOnDocument(
      DB.Collections.values,
      'bulb-control-mode__from-machine',
      true,
      () => {
         log({message: 'bulb-control-mode__from-machine resopnse received.'}, true);
         bulbControlModeRequested.value = false;
      },
      errorData => {
         bulbControlModeRequested.value = false;
         log(errorData);
      });
   
   firestoreService.attachListenerOnDocument(DB.Collections.values,
      'bulb-state__from-machine',
      true,
      (doc) => {
         log({message: 'bulb-state__from-machine response received.'}, true);
         bulbStateRequested.value = false;
         machineData.bulbState = doc.value;
      },
      errorData => {
         bulbStateRequested.value = false;
         log(errorData);
      });


   requestMachineData();
   setInterval(requestMachineData, DATA_INTERVAL);
});
</script>

<template>
   <div>
      <div class="d-flex justify-end">
         <v-icon :color="isPiAlive ? 'green-darken-1' : 'gray'">mdi-checkbox-blank-circle</v-icon>
      </div>
      <div class="card-list my-8">
         <v-card env>
            <v-card-item>
               <v-card-title>Environment</v-card-title>
            </v-card-item>
            <v-card-text>
               <div>
                  <strong>Room Temperature</strong>
                  {{ machineData.thermistor.success ? machineData.thermistor.value.toFixed(1) : null }}
               </div>
               <div class="d-flex">
                  <strong class="text-no-wrap mr-2">Room Light<br />Condition</strong>
                  <span>
                     {{ machineData.photoresistor.success ? machineData.photoresistor.value : null }}
                     <br />
                     <div class="mt-2">[Hint: {{ machineData.photoresistorStatus }}]</div>
                  </span>
               </div>
               <div class="mt-4 d-flex align-center">
                  <label class="font-weight-bold">Bulb Control Mode</label>:
                  <span class="d-flex align-center ml-3" style="gap: 8px">
                     Sensor
                     <v-switch
                        density="compact"
                        :loading="bulbControlModeRequested ? 'primary': false"
                        :false-value="1"
                        :true-value="2"
                        v-model="machineData.bulbControlMode"
                        @change="changeBulbControlMode" />
                     Manual
                  </span>
               </div>
               <div class="mt-4 d-flex align-center">
                  <label class="mr-2 font-weight-bold">Bulb State</label>:
                  <span class="d-flex align-center ml-3" style="gap: 8px">
                     OFF
                     <v-switch
                        density="compact"
                        :loading="bulbStateRequested ? 'primary': false"
                        :disabled="machineData.bulbControlMode === 1"
                        :false-value="0"
                        :true-value="1"
                        v-model="machineData.bulbState"
                        @change="changeBulbState" />
                     ON
                  </span>
               </div>
            </v-card-text>
         </v-card>

         <v-card pi-health>
            <v-card-item>
               <v-card-title>PI Health</v-card-title>
            </v-card-item>
            <v-card-text style="overflow: auto; max-height:300px;">
               <pre v-html="machineData.piHealthData.value"></pre>
            </v-card-text>
         </v-card>

         <v-card misc>
            <v-card-item>
               <v-card-title>Actions & Misc</v-card-title>
            </v-card-item>
            <v-card-text class="d-flex flex-column mt-3" style="row-gap:20px;">
               <div class="d-flex">
                  <label class="mr-3 font-weight-bold">Last checked</label>
                  <div>
                     {{ machineData.time ? machineData.time.toLocaleString() : null }}
                     <br/>
                     {{ machineData.time ? machineData.time.toUTCString() : null }}
                  </div>
               </div>
               <div>
                  <label class="font-weight-bold mr-2">Raspberry PI alive?</label>
                  {{isPiAlive}}
               </div>
               <v-btn variant="tonal" @click="requestMachineData">Request Machine Data</v-btn>
               <v-btn variant="tonal" @click="commandToReboot">Reboot Raspberry Pi</v-btn>
            </v-card-text>
         </v-card>

         <v-card class="console">
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
