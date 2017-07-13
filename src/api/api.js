import axios from 'axios';

let base = 'http://foxfi.eva6.nics.cc:8080';
//let base = 'http://localhost:3000';

const getWithToken = (url, params) => {
	return axios.get(url, { params: params, headers: {"Authorization": "Bearer " + sessionStorage.getItem('token')} });
}

const postWithToken = (url, params) => {
	return axios.post(url, params, { headers: {"Authorization": "Bearer " + sessionStorage.getItem('token')} });
}

const putWithToken = (url, params) => {
	return axios.put(url, params, { headers: {"Authorization": "Bearer " + sessionStorage.getItem('token')} });
}

const deleteWithToken = (url) => {
	return axios.delete(url, { headers: {"Authorization": "Bearer " + sessionStorage.getItem('token')} });
}

export const apiRequestLogin = params => { return axios.post(`${base}/auth`, params) };

export const apiGetUser = id => { return getWithToken(`${base}/api/v1/users/${id}`, {}) };

export const apiFindUser = student_id => { return getWithToken(`${base}/api/v1/users?student_id=${student_id}`, {}) };

export const apiGetUserList = params => { return getWithToken(`${base}/api/v1/users`, params) };

export const apiAddUser = params => { return postWithToken(`${base}/api/v1/users`, params) };

export const apiUpdateUser = (id, params) => { return putWithToken(`${base}/api/v1/users/${id}`, params) };

export const apiDeleteUser = id => { return deleteWithToken(`${base}/api/v1/users/${id}`) };

export const apiResetPassword = id => { return putWithToken(`${base}/api/v1/users/${id}/newPassword`, {}) };

export const apiGetGroups = () => { return getWithToken(`${base}/api/v1/groups`, {}) };

export const apiAddGroup = params => { return postWithToken(`${base}/api/v1/groups`, params) };

export const apiGetFormList = params => { return getWithToken(`${base}/api/v1/forms`, params) }

export const apiUpdateForm = (id, params) => { return putWithToken(`${base}/api/v1/forms/${id}`, params) }

export const apiAddForm = params => { return postWithToken(`${base}/api/v1/forms`, params) }

export const apiDeleteForm = id => { return deleteWithToken(`${base}/api/v1/forms/${id}`) }

export const apiLogout = () => {
	sessionStorage.removeItem("token");
	sessionStorage.removeItem("uid");
	sessionStorage.removeItem("userName");
}

export const apiLogin = (data) => {
	sessionStorage.setItem("token", data.token);
	sessionStorage.setItem("uid", data.id);
}
