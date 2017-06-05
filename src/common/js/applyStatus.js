export default {
	APPLY_STATUS: {
		SUCCESS: "success",
		FAIL: "fail",
		APPLIED: "applied"
	},
	applyStatusString: function(type) {
		if (type === this.APPLY_STATUS.SUCCESS) {
			return "已获得";
		} else if (type === this.APPLY_STATUS.FAIL) {
			return "未获得";
		} else if (type === this.APPLY_STATUS.APPLIED) {
			return "申请中";
		} else {
			return "";
		}
	}
}