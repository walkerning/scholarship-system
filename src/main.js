import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import FormView from './components/formView'
import FormEdit from './components/formEdit'
import QueEditPanel from './components/queEditPanel'
import ApplyStatusTag from './components/applyStatusTag'
import FormRate from './components/formRate'
import './components/queEditPanel/queEditPanel.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import routes from './routes'
import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(QueEditPanel)
Vue.use(FormEdit)
Vue.use(FormView)
Vue.use(ApplyStatusTag)
Vue.use(FormRate)

NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    sessionStorage.removeItem('token');
  }
  let token = sessionStorage.getItem('token');
  if (!token && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

var vueInst = new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app');

// Intercept 401 error
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
    // console.log(error.response.status == 401);
  if (error.response.status == 401) {
    vueInst.$notify({
      title: "登录超时，请重新登录",
      message: "",
      type: "error"
    });
    vueInst.$router.push({ path: "/login" });
    return Promise.reject(error);
  } else {
    return Promise.reject(error);
  }
});

export default vueInst;
