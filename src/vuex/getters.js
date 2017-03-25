//test
export const getFields = state => {
	//console.log(state.form);
	if (state.form == null) {
		return null;
	} else {
    	return state.form.fields;
    }
}
export const getForm = state => {
	return state.form;
}
export const getFill = state => {
	return state.fill;
}
