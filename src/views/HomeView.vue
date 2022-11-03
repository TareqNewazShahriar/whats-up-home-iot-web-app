<script>
import { reactive, onMounted } from 'vue';
import { firestoreService, DB } from '@/services/firestoreService';

const DATA_INTERVAL = 5 * 60 * 1000;

const cliendData = reactive({
   thermistor: null,
   photoresistor: null,
   photoresistorStatus: null,
   bulbControlMode: null,
   bulbState: null,
   lastChecked: null,
   piHealthData: null
})

onMounted(() => {
   firestoreService.attachListenerOnDocument(DB.Collections.values,
   'client-data',
   true,
   data => {
      cliendData.bulbControlMode = data.value;
   });

   setInterval(() => {
      firestoreService.update(DB.Collections.values, 'cliend-data-request__from-client', { value: new Date() })
         .catch();
   }, DATA_INTERVAL)
})

function log(data) {
   firestoreService.create(DB.Collections.logs, data, new Date().toJSON())
}

</script>

<template>
   <div>
      <h1>Home IoT</h1>
      <table>
         <tr>
            <th>Room Temperature</th>
            <td>{{clientData.thermistor}}</td>
         </tr>
         <tr>
            <th>Room Light Condition</th>
            <td>
               {{clientData.photoresistor}}
               <br>
               <small>[Hint: {{clientData.photoresistorStatus}}]</small>
            </td>
         </tr>
         <tr>
            <th>Bulb Control Mode</th>
            <td>
               <label><input type="radio" v-model="clientData.bulbControlMode" value="1"> Sensor</label>
               <label><input type="radio" v-model="clientData.bulbControlMode" value="2"> Manual</label>
            </td>
         </tr>
         <tr>
            <th>Bulb State</th>
            <td>
               <label><input type="radio" v-model="clientData.bulbState" value="1" disabled> ON</label>
               <label><input type="radio" v-model="clientData.bulbState" value="0" disabled> OFF</label>
            </td>
         </tr>
         <tr>
            <th>Last checked</th>
            <td><b>{{clientData.lastChecked}}</b></td>
         </tr>
         <tr>
            <th>Pi Health Data</th>
            <td>
               <div style="overflow: auto; width: 60vw;">
                  <pre v-html="piHealthData"></pre>
               </div>
            </td>
         </tr>
         <tr>
            <th>Actions</th>
            <td>
               <button type="button" id="stat">PI Health</button>
               <button type="button" id="terminate-app">Terminate Node App</button>
               <button type="button" id="reboot">Reboot Raspberry Pi</button>
            </td>
         </tr>
      </table>
      <footer>
         <pre id="notify"></pre>
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
