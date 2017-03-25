import FormView from "./formView.vue"

FormView.install = function(Vue) {
	Vue.component("FormView", FormView);
}

export default FormView;