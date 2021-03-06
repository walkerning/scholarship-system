export const setForm = ({commit}, form) => {
	commit("SET_FORM", form);
}

export const moveUpQue = ({commit}, index) => {
	commit("MOVE_UP_QUE", index);
}

export const moveDownQue = ({commit}, index) => {
	commit("MOVE_DOWN_QUE", index);
}

export const deleteQue = ({commit}, index) => {
	commit("DELETE_QUE", index);
}

export const deleteQueOption = ({commit}, indexes) => {
	commit("DELETE_QUE_OPTION", indexes);
}

export const addQueOption = ({commit}, index) => {
	commit("ADD_QUE_OPTION", index);
}

export const setFill = ({commit}, fill) => {
	commit("SET_FILL", fill);
}

export const addQue = ({commit}, que) => {
	commit("ADD_QUE", que);
}

export const addFillOption = ({commit}, param) => {
	commit("ADD_FILL_OPTION", param);
}

export const deleteFillOption = ({commit}, indexes) => {
	commit("DELETE_FIELD_OPTION", indexes);
}

export const setRate = ({commit}, rate) => {
	commit("SET_RATE", rate);
}

export const addRate = ({commit}, param) => {
	commit("ADD_RATE", param);
}

export const deleteRate = ({commit}, key) => {
	commit("DELETE_RATE", key);
}