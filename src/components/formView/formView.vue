<template>
	<section>
		<el-form :model="getFill" label-width="250px" :rules="formRules" ref="form">
			<div>
				<template v-for="(field, index) in getFields">
					<template v-if="field.type === _QUE_TYPE.ILLUSTRATION"> <!--说明文字-->
						<el-row>
							<pre style="white-space: pre-wrap;word-wrap: break-word;">{{ field.description }}</pre>
						</el-row>
						<hr />
					</template>
					<template v-else-if="field.type === _QUE_TYPE.NUMBER"><!--数字-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-input v-model="getFill['data' + index]" :placeholder="'数字' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '~' + String(field.max_len) + ')' : '') "  auto-complete="off" :disabled="disabled"></el-input>
						</el-form-item>
					</template>
					<template v-else-if="field.type === _QUE_TYPE.EMAIL"><!--邮箱-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-input v-model="getFill['data' + index]" placeholder="邮箱" :disabled="disabled"></el-input>
						</el-form-item>					
					</template>
					<template v-else-if="field.type === _QUE_TYPE.PHONE"><!--手机-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-input v-model="getFill['data' + index]" placeholder="手机" :disabled="disabled"></el-input>
						</el-form-item>								
					</template>
					<template v-else-if="field.type === _QUE_TYPE.STRING_SINGLE_LINE"><!--单行字符串-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-input v-model="getFill['data' + index]" :placeholder="'单行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="disabled"></el-input>
						</el-form-item>
					</template>
					<template v-else-if="field.type === _QUE_TYPE.STRING_MULTIPLE_LINE"><!--多行字符串-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-input v-model="getFill['data' + index]" type="textarea" autosize :placeholder="'多行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="disabled"></el-input>
						</el-form-item>						
					</template>
					<template v-else-if="field.type === _QUE_TYPE.CHECKBOX"><!--多选框-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-checkbox-group v-model="getFill['data' + index]">
								<template v-for="choice in field.content">
									<el-checkbox :label="choice" :disabled="disabled"></el-checkbox>
								</template>
							</el-checkbox-group>
							<template v-if="field.min_len <= field.max_len">
								<font color="blue"><i>请选择{{ field.min_len }}至{{ field.max_len }}个选项</i></font>
							</template>
						</el-form-item>								
					</template>
					<template v-else-if="field.type === _QUE_TYPE.RATIO"><!--单选框-->
						<el-form-item :label="field.description" :required="field.required" :prop="'data' + index">
							<el-radio-group v-model="getFill['data' + index]">
								<template v-for="choice in field.content">
									<el-radio :label="choice" :disabled="disabled"></el-radio>
								</template>
							</el-radio-group>
						</el-form-item>							
					</template>
					<template v-else-if="field.type === _QUE_TYPE.TABLE"><!--表格-->
						<el-row>
							<pre style="white-space: pre-wrap;word-wrap: break-word;">{{ field.description }}</pre>
						</el-row>
						<el-table :data="getFill['data' + index]">
							<template v-for="(column, index2) in field.content">
								<el-table-column :label="column">
									<template scope="scope">
										<el-input type="textarea" autosize v-model="scope.row[index2]" :disabled="disabled"></el-input>
									</template>
								</el-table-column>
							</template>
							<el-table-column label="删除">
								<template scope="scope">
									<el-button type="danger" size="small" @click="deleteFillOption({index1: 'data' + index, index2: scope.$index})" :disabled="disabled">删除记录</el-button> 
								</template>
							</el-table-column>
						</el-table>
						<el-button type="primary" size="small" @click.native="addFillOption({index: 'data' + index, num: field.content.length})" :disabled="disabled">新增记录</el-button>
						<hr />
					</template>
				</template>
			</div>
			<div v-if="getForm.template !== null && getForm.template !== '' && getForm.template !== undefined">
				<el-row type="flex" justify="center">
					<el-button type="warning" @click.native="print">打印</el-button>
				</el-row>
			</div>
		</el-form>
	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import QueType from "../../common/js/queType"
	import util from "../../common/js/util.js"
	export default {
		props: {
			disabled: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			...mapGetters([
				"getForm",
				"getFields",
				"getFill"
			]),
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			},
			formRules: function() {
				var validator = (rule, value, callback) => {
					if (value === undefined) {
						callback();
						return;
					}
					var id = parseInt(rule.field.substring(4));
					var field = this.getFields[id];
					switch(field.type) {
						case this._QUE_TYPE.ILLUSTRATION:
							callback();
							break;
						case this._QUE_TYPE.NUMBER:
							if (field.required && (value === null || value === "")) {
								callback(new Error("不能为空"));
								break;
							}
							if (value !== null && value !== "") {
								var a = parseFloat(value);
								if (a.toString() !== value) {
									callback(new Error("请输入数字"));
									break;
								}
								if (field.min_len < field.max_len) {
									if (!((field.min_len <= a) && (a <= field.max_len))) {
										callback(new Error("数字需要在" + field.min_len + "到" + field.max_len + "之间"));
										break;
									}
								}
							}
							callback();
							break;
						case this._QUE_TYPE.EMAIL:
							if (field.required && (value === null || value === "")) {
								callback(new Error("不能为空"));
								break;								
							}
							var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
							if (!re.test(value)) {
								callback(new Error("请输入正确的邮箱"));
								break;
							}
							callback();
							break;
						case this._QUE_TYPE.PHONE:
							if (field.required && (value === null || value === "")) {
								callback(new Error("不能为空"));
								break;								
							}
							var re = /^1\d{10}$/;
							if (!re.test(value)) {
								callback(new Error("请输入正确的电话号码"));
								break;
							}
							callback();
							break;
						case this._QUE_TYPE.STRING_SINGLE_LINE:
						case this._QUE_TYPE.STRING_MULTIPLE_LINE:
							if (field.required && (value === null || value === "")) {
								callback(new Error("不能为空"));
								break;								
							}
							if (value !== null && value !== "") {
								var a = value.length;
								if (field.min_len < field.max_len) {
									if (!((field.min_len <= a) && (a <= field.max_len))) {
										callback(new Error("字符数需要在" + field.min_len + "到" + field.max_len + "之间，已有" + a + "字符"));
										break;
									}
								}
							}
							callback();
							break;
						case this._QUE_TYPE.CHECKBOX:
							if (field.required && (value === null || value.length === 0)) {
								callback(new Error("不能为空"));
								break;								
							}
							if (value !== null && value.length !== 0) {
								var a = value.length;
								if (field.min_len < field.max_len) {
									if (!((field.min_len <= a) && (a <= field.max_len))) {
										callback(new Error("选项数需要在" + field.min_len + "到" + field.max_len + "之间，已选" + a + "个选项"));
										break;
									}
								}
							}
							callback();
							break;
						case this._QUE_TYPE.RATIO:
							if (field.required && (value === null || value === "")) {
								callback(new Error("不能为空"));
								break;								
							}
							callback();
							break;
						case this._QUE_TYPE.ATTACHMENT:
							callback();
							break;
						case this._QUE_TYPE.UPLOAD:
							callback();
							break;
						default:
							callback();
							break;
					}
				};
				var rule = {};
				for (var i in this.getFields) {
					var field = this.getFields[i];
					var key = "data" + i;
					if (field.type === this._QUE_TYPE.RATIO || field.type === this._QUE_TYPE.CHECKBOX) {
						rule[key] = [{validator: validator, trigger: "change"}];
					} else {
						rule[key] = [{validator: validator, trigger: "blur"}];
					}
				}
				return rule;
			}
		},
		data() {
			return {
			}
		},
		methods: {
			...mapActions([
				"setFill",
				"addFillOption",
				"deleteFillOption"
			]),
			print: function() {
			  var body = this.getForm.template;
			  for (var i in this.getFill) {
			    var regExp = new RegExp("{{" + i + "}}", "g");
                            body = body.replace(regExp, JSON.stringify(this.getFill[i]).slice(1, -1));
			  }
                          var docdef = JSON.parse(body);
                          docdef["defaultStyle"] = {font: "chinese"};
                          pdfMake.fonts = {
                            chinese: {
                              normal: 'msyh.ttf',
                              bold: 'msyh.ttf',
                              italics: 'msyh.ttf',
                              bolditalics: 'msyh.ttf'
                            }
                          };
			  pdfMake.createPdf(docdef).open();
			},

			validate: function(callback) {
				this.$refs.form.validate(callback);
			}
		}
	}
</script>
