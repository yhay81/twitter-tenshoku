import Vue from "vue";
import App from "./App.vue";
import VueSession from "vue-session";
Vue.use(VueSession);
new Vue({
  el: "#app",
  render: h => h(App)
});
