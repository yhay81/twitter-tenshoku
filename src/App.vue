<template>
  <div id="app">
    <header>
    <h1>Twitter TENSHOKU</h1>
    <div class="login">
      <a v-if="!connected" href="/auth/twitter">Sign up/in with twitter</a>
      <span v-if="connected" href="/auth/twitter">{{ userName }}</span>
    </div>
    </header>
    <main>
      <div>{{ $session.getAll() }}</div>
      <!-- <div v-if="connected && !haveResume"> -->
      <div v-if="true">
        <textarea v-model="message" placeholder="add multiple lines"></textarea>
        <button v-on:click="getResume()">Creat Picture</button>
      </div>
      <div v-if="haveResume">
        <img class="resume" :src="resume" >
        <button v-on:click="tweet()">Tweet Resume</button>
      </div>
    </main>
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
    resume: "",
    userName: ""
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
    },
    tweet: function() {
      postData("/tweet/", { text: this.message })
        .then(data => console.log(data))
        .catch(error => console.error(error));
    }
  }
};
</script>

<style>
body {
  margin: 0;
  background: rgb(153, 199, 230);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

header {
  display: flex;
}

h1 {
  margin: 0;
  padding: 10px;
}

.login {
  margin: auto;
}

main {
  text-align: center;
}

.resume {
  max-width: 600px;
}

button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 12px;
}

header {
  width: 100%;
  background-color: white;
}
</style>
