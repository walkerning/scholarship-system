import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'

Vue.use(Vuex)

// 应用初始状态
const state = {
	form: null,
	fill: null
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
	}
}

// 创建 store 实例
export default new Vuex.Store({
	actions,
	getters,
	state,
	mutations
})