export default {
	PERMISSION_TYPE: {
		LOGIN: "login",
		APPLY: "apply",
		USER: "user",
		FORM: "form",
		SCHOLAR: "scholar",
		HONOR: "honor",
		EXPORT: "export"
	},
	permissionTypeString: function(type) {
		if (type === this.PERMISSION_TYPE.LOGIN) {
			return "有效";
		} else if (type === this.PERMISSION_TYPE.APPLY) {
			return "奖学金荣誉申请";
		} else if (type === this.PERMISSION_TYPE.USER) {
			return "用户管理";
		} else if (type === this.PERMISSION_TYPE.FORM) {
			return "表单管理";
		} else if (type === this.PERMISSION_TYPE.SCHOLAR) {
			return "奖学金管理";
		} else if (type === this.PERMISSION_TYPE.HONOR) {
			return "荣誉管理";
		} else if (type === this.PERMISSION_TYPE.EXPORT) {
			return "学校奖助系统对接";
		} else {
			return "";
		}
	}
}