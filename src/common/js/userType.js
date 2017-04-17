export default {
	USER_TYPE: {
		UNDERGRADUATE: "undergraduate",
		GRADUATE: "graduate",
		FACULTY: "faculty"
	},
	userTypeString: function(type) {
		if (type === this.USER_TYPE.UNDERGRADUATE) {
			return "本科生";
		} else if (type === this.USER_TYPE.GRADUATE) {
			return "研究生";
		} else if (type === this.USER_TYPE.FACULTY) {
			return "教师";
		} else {
			return "";
		}
	}
}