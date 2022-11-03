<script setup>
import { reactive, onMounted } from 'vue';
import { firestoreService, DB } from '@/services/firestoreService';

const DATA_INTERVAL = 5 * 60 * 1000;

const machineData = reactive({
   thermistor: {},
   photoresistor: {},
   photoresistorStatus: null,
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
      data => { Object.assign(machineData, data); log({message: `Received '${data.id}' response.`}); },
      log);

   setInterval(
      (function clientDataRequest() {
         firestoreService.update(DB.Collections.values, 'machine-data-request', { value: new Date() }).catch(log);
         return clientDataRequest;
      })(),
      DATA_INTERVAL);
});

function changeBulbControlMode() {
   if(confirm('Change bulb control mode?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-control-mode__from-client', { value: new Date() }).catch(log);
   }
}

function changeBulbState() {
   if(confirm('Change bulb state?') === true) {
      firestoreService.update(DB.Collections.values, 'bulb-state__from-client', { value: new Date() }).catch(log);
   }
}

function commandToReboot() {
   if(confirm('Confirm reboot?') == true) {
      firestoreService.update(DB.Collections.values, 'reboot__from-client', { value: new Date() }).catch(log);
   }
}

function log(data) {
   firestoreService.create(DB.Collections.logs, data, new Date().toUTCString())
      .catch(error => logData.push({time: new Date().toUTCString(), error}));
   
   logData.push({time: new Date().toUTCString(), data});
}
</script>

<template>
   <div>
      <h1>Home IoT</h1>
      <table>
         <tr>
            <th>Room Temperature</th>
            <td>{{machineData.thermistor.success ? machineData.thermistor.value : null}}</td>
         </tr>
         <tr>
            <th>Room Light Condition</th>
            <td>
               {{machineData.photoresistor.success ? machineData.photoresistor.value : null}}
               <br>
               <small>[Hint: {{machineData.photoresistorStatus}}]</small>
            </td>
         </tr>
         <tr>
            <th>Bulb Control Mode</th>
            <td>
               <label><input type="radio" v-model="machineData.bulbControlMode" value="1"> Sensor</label>
               <label><input type="radio" v-model="machineData.bulbControlMode" value="2"> Manual</label>
            </td>
         </tr>
         <tr>
            <th>Bulb State</th>
            <td>
               <label><input type="radio" v-model="machineData.bulbState" value="1" disabled> ON</label>
               <label><input type="radio" v-model="machineData.bulbState" value="0" disabled> OFF</label>
            </td>
         </tr>
         <tr>
            <th>Last checked</th>
            <td><b>{{machineData.time}}</b></td>
         </tr>
         <tr>
            <th>Pi Health Data</th>
            <td>
               <div style="overflow: auto; width: 60vw;">
                  <pre v-html="machineData.piHealthData.value"></pre>
               </div>
            </td>
         </tr>
         <tr>
            <th>Actions</th>
            <td>
               <v-btn @click="commandToReboot">Reboot Raspberry Pi</v-btn>
            </td>
         </tr>
      </table>
      <footer>
         <pre>{{logData}}</pre>
      </footer>
   </div>
</template>

<style>
th,
td {
   border-top: 1px solid black;
}

th {
   text-align: left;
   vertical-align: top;
}

button {
   margin: 4px;
   padding: 8px;
}

input[type=checkbox],
input[type=radio] {
   height: 20px;
   width: 20px;
}

footer {
   background-color: black;
   border: inset black;
   bottom: 0;
   color: whitesmoke;
   padding: 5px;
   overflow: auto;
}
</style>
