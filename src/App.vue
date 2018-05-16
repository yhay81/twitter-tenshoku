<template>
  <div id="app">
    <header>
    <h1>Twitter TENSHOKU</h1>
    <div class="login">
      <a v-if="!userName" href="/auth/twitter">Sign up/in with twitter</a>
      <span v-if="userName" href="/auth/twitter">{{ userName }}</span>
    </div>
    </header>
    <main>
      <div class="form">
        <input type="text" class="content-form" v-model="content" placeholder="Add any text/hashtags like #Twitter転職" />
        <input v-if="!haveResume" type="text" class="resume-form" v-model="message" placeholder="Add your skill/want" />
        <button v-if="!haveResume" v-on:click="getResume()">Creat Picture</button>
      </div>
      <div v-if="haveResume">
        <img class="resume" :src="resume" >
        <button v-on:click="tweet()">Tweet Resume</button>
      </div>
      <div class="complete">{{ complete }}</div>
    </main>
    <footer><div>Author:<a href="https://github.com/yhay81/twitter-tenshoku">Yusuke Hayashi</a></div></footer>
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
    userName: "",
    complete: ""
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
      postData("/tweet/", { text: this.message, content: this.content })
        .then(data => {
          this.complete = "Sent!!";
        })
        .catch(error => console.error(error));
    }
  }
};
</script>

<style>
body {
  margin: 0;
  background: rgb(185, 209, 224);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

header {
  display: flex;
  width: 100%;
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
}

h1 {
  margin: 0;
  padding: 10px;
  color: #555;
}

.login {
  margin: auto;
}

main {
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
}

::placeholder {
  color: #aaa;
}

.content-form {
  border: 0;
  padding: 10px;
  font-size: 1.3em;
  font-family: Arial, sans-serif;
  color: #777;
  border: solid 1px #ccc;
  margin: 0 0 20px;
  width: 600px;
  margin: 10px auto;
  border-radius: 3px;
}

.resume-form {
  border: 0;
  padding: 10px;
  font-size: 1.3em;
  font-family: Arial, sans-serif;
  color: #777;
  border: solid 1px #ccc;
  margin: 0 0 20px;
  width: 600px;
  height: 100px;
  margin: 10px auto;
  border-radius: 3px;
}
input:focus {
  border: solid 1px #684aee;
}

button {
  background-color: #fff;
  border: 2px solid #2f689b;
  color: #2f689b;
  cursor: pointer;
  display: inline-block;
  border: none;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  max-width: 200px;
  margin: auto;
}

.resume {
  display: flex;
  max-width: 600px;
  margin: 30px auto;
}

.complete {
  margin: 10px;
  color: #235f7a;
}

footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 1rem;
  background-color: rgb(168, 190, 204);
  text-align: center;
}
</style>
