export default {
	QUE_TYPE: {
		ILLUSTRATION: 1,
		NUMBER: 2,
		EMAIL: 3,
		PHONE: 4,
		STRING_SINGLE_LINE: 5,
		STRING_MULTIPLE_LINE: 6,
		CHECKBOX: 7,
		RATIO: 8,
		ATTACHMENT: 9,
		UPLOAD: 10
	},
	queTypeString: function(type) {
		if (type === this.QUE_TYPE.ILLUSTRATION) {
			return "说明文字";
		} else if (type === this.QUE_TYPE.NUMBER) {
			return "数字";
		} else if (type === this.QUE_TYPE.EMAIL) {
			return "邮箱";
		} else if (type === this.QUE_TYPE.PHONE) {
			return "手机";
		} else if (type === this.QUE_TYPE.STRING_SINGLE_LINE) {
			return "单行字符串";
		} else if (type === this.QUE_TYPE.STRING_MULTIPLE_LINE) {
			return "多行字符串";
		} else if (type === this.QUE_TYPE.CHECKBOX) {
			return "多选框";
		} else if (type === this.QUE_TYPE.RATIO) {
			return "单选框";
		} else if (type === this.QUE_TYPE.ATTACHMENT) {
			return "附件说明";
		} else if (type === this.QUE_TYPE.UPLOAD) {
			return "上传附件";
		}
	}
}