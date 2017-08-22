import axios from 'axios';
import UserType from "../common/js/userType"
import vueInst from "../main"

// Intercept 401 error
axios.interceptors.response.use(function (response) {
	return response;
}, function (error) {
	console.log(error.response.status == 401);
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


//let base = 'http://foxfi.eva6.nics.cc:8080';
let base = 'http://localhost:3000';

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

export const apiGetUserList = params => { return getWithToken(`${base}/api/v1/users`, params) };

export const apiAddUser = params => { return postWithToken(`${base}/api/v1/users`, params) };

export const apiUpdateUser = (id, params) => { return putWithToken(`${base}/api/v1/users/${id}`, params) };

export const apiDeleteUser = id => { return deleteWithToken(`${base}/api/v1/users/${id}`) };

export const apiResetPassword = id => { return putWithToken(`${base}/api/v1/users/${id}/newPassword`, {}) };

export const apiGetGroup = () => { return getWithToken(`${base}/api/v1/groups`, {}) };

export const apiAddGroup = params => { return postWithToken(`${base}/api/v1/groups`, params) };

export const apiGetFormList = params => { return getWithToken(`${base}/api/v1/forms`, params) };

export const apiGetForm = id => { return getWithToken(`${base}/api/v1/forms/${id}`) };

export const apiUpdateForm = (id, params) => { return putWithToken(`${base}/api/v1/forms/${id}`, params) };

export const apiAddForm = params => { return postWithToken(`${base}/api/v1/forms`, params) };

export const apiDeleteForm = id => { return deleteWithToken(`${base}/api/v1/forms/${id}`) };

export const apiGetPermission = () => { return getWithToken(`${base}/api/v1/permissions`, {}) };

export const apiGetPermissionUser = name => { return getWithToken(`${base}/api/v1/permissions/${name}/users`, {}) };

export const apiAddPermissionUser = (permissionName, userId) => { return postWithToken(`${base}/api/v1/permissions/${permissionName}/users`, {user_id: userId}) };

export const apiDeletePermissionUser = (permissionName, userId) => { return deleteWithToken(`${base}/api/v1/permissions/${permissionName}/users/${userId}`) };

export const apiGetHonorList = params => { return getWithToken(`${base}/api/v1/honors`, params) };

export const apiGetHonor = id => { return getWithToken(`${base}/api/v1/honors/${id}`) };

export const apiAddHonor = params => { return postWithToken(`${base}/api/v1/honors`, params) };

export const apiUpdateHonor = (id, params) => { return putWithToken(`${base}/api/v1/honors/${id}`, params) };

export const apiDeleteHonor = id => { return deleteWithToken(`${base}/api/v1/honors/${id}`) };

export const apiGetUserHonor = (id, params) => { return getWithToken(`${base}/api/v1/users/${id}/honors`, params) };

export const apiApplyUserHonor = (id, params) => { return postWithToken(`${base}/api/v1/users/${id}/honors`, params) };

export const apiUpdateUserHonor = (id, honorId, params) => { return putWithToken(`${base}/api/v1/users/${id}/honors/${honorId}`, params) };

export const apiDeleteUserHonor = (id, honorId) => { return deleteWithToken(`${base}/api/v1/users/${id}/honors/${honorId}`) };

export const apiUpdateUserHonorAdmin = (id, honorId, params) => { return putWithToken(`${base}/api/v1/users/${id}/honors/${honorId}/admin`, params) };

export const apiGetGroupHonor = (id, params) => { return getWithToken(`${base}/api/v1/groups/${id}/honors`, params) };

export const apiAddUserHonorScore = (id, honorId, params) => { return postWithToken(`${base}/api/v1/users/${id}/honors/${honorId}/scores`, params) };

export const apiUpdateUserHonorScore = (id, honorId, scorerId, params) => { return putWithToken(`${base}/api/v1/users/${id}/honors/${honorId}/scores/${scorerId}`, params) };

export const apiDeleteUserHonorScore = (id, honorId, scorerId) => { return deleteWithToken(`${base}/api/v1/users/${id}/honors/${honorId}/scores/${scorerId}`) };

export const apiGetScholarship = id => { return getWithToken(`${base}/api/v1/scholars/${id}`, {}) };

export const apiGetScholarshipList = params => { return getWithToken(`${base}/api/v1/scholars`, params) };

export const apiAddScholarship = params => { return postWithToken(`${base}/api/v1/scholars`, params) };

export const apiUpdateScholarship = (id, params) => { return putWithToken(`${base}/api/v1/scholars/${id}`, params) };

export const apiDeleteScholarship = id => { return deleteWithToken(`${base}/api/v1/scholars/${id}`) };

export const apiGetUserScholarship = id => { return getWithToken(`${base}/api/v1/users/${id}/scholars`, {}) };

export const apiAddUserScholarship = (id, params) => { return postWithToken(`${base}/api/v1/users/${id}/scholars`, params) };

export const apiUpdateUserScholarship = (id, scholarshipId, params) => { return putWithToken(`${base}/api/v1/users/${id}/scholars/${scholarshipId}`, params) };

export const apiAddUserScholarshipForm = (id, scholarshipId, params) => { return postWithToken(`${base}/api/v1/users/${id}/scholars/${scholarshipId}/thanksletter`, params) };

export const apiUpdateUserScholarshipForm = (id, scholarshipId, params) => { return putWithToken(`${base}/api/v1/users/${id}/scholars/${scholarshipId}/thanksletter`, params) }

export const apiDeleteUserScholarship = (id, scholarshipId) => { return deleteWithToken(`${base}/api/v1/users/${id}/scholars/${scholarshipId}`) };

export const apiGetGroupScholarship = (id, params) => { return getWithToken(`${base}/api/v1/groups/${id}/scholars`, params) };

export const apiGetGroupId = (group_name, group_type) => {
	return apiGetGroup().then(res => {
		//console.log(res);
		var start = null;
		var groups = res.data;
		for (var i = 0; i < groups.length; i++) {
			if (groups[i].name === group_name && groups[i].type === group_type) {
				start = Promise.resolve(groups[i].id);
				break;
			}
		}
		if (start == null) {
			var params = {
				name: group_name,
				type: group_type,
				description: group_name + "级" + UserType.userTypeString(group_type)
			};
			//console.log(params);
			start = apiAddGroup(params).then(res => {
				//console.log(res);
				return res.data.id;
			})
		}
		return start;
	})
};

export const apiAddGroups = groups => {
	return apiGetGroup().then(res => {
		var old_groups = _.map(res.data, group => { return { name: group.name, key: group.key} });
		var tasks = [];
		for (var i in groups) {
			if (_.find(old_groups, groups[i]) == undefined) {
				tasks.push(() => {
					var params = {
						name: groups[i].name,
						type: groups[i].type,
						description: groups[i].name + "级" + UserType.userTypeString(groups[i].type)
					};
					return apiAddGroup(params);	
				})
				old_groups.push(groups[i]);
			}
		}
		return Promise.all(tasks);
	})
};

export const apiLogout = () => {
	sessionStorage.removeItem("token");
	sessionStorage.removeItem("uid");
	sessionStorage.removeItem("user");
};

export const apiLogin = (data) => {
	sessionStorage.setItem("token", data.token);
	sessionStorage.setItem("uid", data.user.id);
	sessionStorage.setItem("user", JSON.stringify(data.user));
};
