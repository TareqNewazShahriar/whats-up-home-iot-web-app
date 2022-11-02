<script setup>

</script>

<template>
   <div>
      <h1>Home IoT</h1>
      <table>
         <tr>
            <th>Room Temperature</th>
            <td><span id="thermistor"></span></td>
         </tr>
         <tr>
            <th>Room Light Condition</th>
            <td>
               <span id="photoresistor"></span>
               <br>
               <small>[Hint: <span id="photoresistorStatus"></span>]</small>
            </td>
         </tr>
         <tr>
            <th>Bulb Control Mode</th>
            <td>
               <label><input type="radio" name="bulbControlMode" value="1"> Sensor</label>
               <label><input type="radio" name="bulbControlMode" value="2"> Manual</label>
            </td>
         </tr>
         <tr>
            <th>Bulb State</th>
            <td>
               <label><input type="radio" name="bulbState" value="1" disabled> ON</label>
               <label><input type="radio" name="bulbState" value="0" disabled> OFF</label>
            </td>
         </tr>
         <tr>
            <th>
               Connected Clients
            </th>
            <td>
               <span id="connectionCount"></span>
               <br>
               <small style="font-weight: normal;">(number of clients connected to Raspberry PI over internet)</small>
            </td>
         </tr>
         <tr>
            <th>Local Proxy Status</th>
            <td><span id="local-proxy-status"></span></td>
         </tr>
         <tr>
            <th>Last checked</th>
            <td><b id="last-checked"></b></td>
         </tr>
         <tr>
            <th>Pi Health Data</th>
            <td>
               <div style="overflow: auto; width: 60vw;">
                  <pre id="pi-health-data"></pre>
               </div>
            </td>
         </tr>
         <tr>
            <th>Actions</th>
            <td>
               <button type="button" id="stat">PI Health</button>
               <button type="button" id="terminate-app">Terminate Node App</button>
               <button type="button" id="reboot">Reboot Raspberry Pi</button>
               <button type="button" id="poweroff">Poweroff Raspberry Pi</button>
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
