export default {
	FORM_TYPE: {
		APPLY: "apply",
		THANKS: "thanks"
	},
	formTypeString: function(type) {
		if (type === this.FORM_TYPE.APPLY) {
			return "荣誉申请表";
		} else if (type === this.FORM_TYPE.THANKS) {
			return "奖学金感谢信表";
		} else {
			return "";
		}
	}
}