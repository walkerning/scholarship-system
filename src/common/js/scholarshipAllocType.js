export default {
	SCHOLARSHIP_ALLOC_TYPE: {
		QUOTA: "quota",
		MONEY: "money"
	},
	scholarshipAllocTypeString: function(type) {
		if (type === this.SCHOLARSHIP_ALLOC_TYPE.QUOTA) {
			return "按名额分配";
		} else if (type === this.SCHOLARSHIP_ALLOC_TYPE.MONEY) {
			return "按金额分配";
		} else {
			return "";
		}
	}
}