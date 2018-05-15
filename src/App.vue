<template>
  <div id="app">
    Twitter TENSHOKU
    <a v-if="!connected" href="/auth/twitter">Sign up/in with twitter</a>
    <!-- <div v-if="connected && !haveResume"> -->
    <div v-if="true">
      <textarea v-model="message" placeholder="add multiple lines"></textarea>
      <button v-on:click="getResume()">Creat Picture</button>
    </div>
    <div v-if="haveResume">
      <img class="resume" :src="resume" >
      <button>Tweet Resume</button>
    </div>
  </div>
</template>

<script>
const postData = (url, data) => {
  // Default options are marked with *
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, same-origin, *omit
    headers: {
      "user-agent": "Mozilla/4.0 MDN Example",
      "content-type": "application/json"
    },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer" // *client, no-referrer
  });
};
const arrayBufferToBase64 = buffer => {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
};
export default {
  name: "App",
  data: () => ({
    connected: false,
    haveResume: false,
    resume: ""
  }),
  computed: {
    connect: function() {
      this.connected = !this.connected;
    },
    getResume: function() {
      postData("/api/", { text: this.message })
        .then(data => data.arrayBuffer())
        .then(buffer => {
          const imageStr = arrayBufferToBase64(buffer);
          this.resume = "data:image/png;base64," + imageStr;
          this.haveResume = true;
        })
        .catch(error => console.error(error));
    }
  }
};
</script>

<style>
#app {
  text-align: center;
}
.resume {
  max-width: 500px;
}
body {
  background: rgb(153, 199, 230);
}
</style>
