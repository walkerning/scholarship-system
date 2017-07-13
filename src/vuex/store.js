import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

// 应用初始状态
const state = {
	form: null,
	fill: null,
	rate: null
}

// 定义所需的 mutations
const mutations = {
	SET_FORM(state, form) {
		state.form = form;
	},
	MOVE_UP_QUE(state, index) {
		if (index === 0) {
			return;
		}
		var item = state.form.fields[index];
		state.form.fields.splice(index, 1);
		state.form.fields.splice(index - 1, 0, item);
	},
	MOVE_DOWN_QUE(state, index) {
		if (index === state.form.fields.length - 1) {
			return;
		}
		var item = state.form.fields[index];
		state.form.fields.splice(index, 1);
		state.form.fields.splice(index + 1, 0, item);
	},
	DELETE_QUE(state, index) {
		state.form.fields.splice(index, 1);
	},
	DELETE_QUE_OPTION(state, indexes) {
		state.form.fields[indexes.index1].content.splice(indexes.index2, 1);
	},
	ADD_QUE_OPTION(state, index) {
		state.form.fields[index].content.push("");
	},
	SET_FILL(state, fill) {
		state.fill = fill;
	},
	ADD_QUE(state, que) {
		state.form.fields.splice(state.form.fields.length, 0, que);
	},
	ADD_FILL_OPTION(state, param) {
		var l = [];
		for (var i = 0; i < param.num; i++) {
			l.push("");
		}
		state.fill[param.index].push(l);
	},
	DELETE_FIELD_OPTION(state, indexes) {
		state.fill[indexes.index1].splice(indexes.index2, 1);
	},
	SET_RATE(state, rate) {
		state.rate = rate;
	},
	ADD_RATE(state, param) {
		Vue.set(state.rate, param.key, param.value);
	},
	DELETE_RATE(state, key) {
		Vue.delete(state.rate, key);
	}
}

// 创建 store 实例
export default new Vuex.Store({
	actions,
	getters,
	state,
	mutations
})