<template>
	<section>
		<el-form :model="getForm" label-width="250px" :rules="editFormRules" ref="getForm">
			<el-row>
				<b> 基本信息 </b>
			</el-row>
			<el-row>
				<el-col :offset="1" :span="4">
					表单名字：
				</el-col>
				<el-col :span="19">
					<el-input placeholder="请输入表单名字" v-model="getForm.name"></el-input>
				</el-col>
			</el-row>
			<el-row>
				<el-col :offset="1" :span="4">
					类别：
				</el-col>
				<el-col :span="19">
					<el-select v-model="getForm.type" placeholder="请选择类别">
						<el-option label="荣誉申请表" value="apply"> </el-option>
						<el-option label="奖学金感谢信表" value="thanks"> </el-option>
					</el-select>
				</el-col>
			</el-row>
			<hr />
			<template v-for="(field, index) in getFields">
				<el-row>
					<b> 第{{ index + 1 }}题：{{ _queTypeString(field.type) }} </b>
				</el-row>
				
				<template v-if="field.type === _QUE_TYPE.ILLUSTRATION"> <!--说明文字-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="true" :disableDescription="false">
						<div slot="slotPreivew">
							<pre>{{field.description}}</pre>
						</div>
					</que-edit-panel>
				</template>
				<template v-else-if="field.type === _QUE_TYPE.NUMBER"><!--数字-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false" minLenString="最小值" maxLenString="最大值">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-input :placeholder="'数字' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '~' + String(field.max_len) + ')' : '')" :disabled="true"></el-input>
							</el-form-item>
						</div>
					</que-edit-panel>
				</template>
				<template v-else-if="field.type === _QUE_TYPE.EMAIL"><!--邮箱-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-input placeholder="邮箱" :disabled="true"></el-input>
							</el-form-item>			
						</div>	
					</que-edit-panel>		
				</template>
				<template v-else-if="field.type === _QUE_TYPE.PHONE"><!--手机-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-input placeholder="手机" :disabled="true"></el-input>
							</el-form-item>		
						</div>
					</que-edit-panel>							
				</template>
				<template v-else-if="field.type === _QUE_TYPE.STRING_SINGLE_LINE"><!--单行字符串-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false" minLenString="最短长度" maxLenString="最长长度">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-input :placeholder="'单行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="true"></el-input>
							</el-form-item>
						</div>
					</que-edit-panel>
				</template>
				<template v-else-if="field.type === _QUE_TYPE.STRING_MULTIPLE_LINE"><!--多行字符串-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false" minLenString="最短长度" maxLenString="最长长度">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-input type="textarea" autosize :placeholder="'多行字符串' + (field.min_len <= field.max_len ? '(' + String(field.min_len) + '字符~' + String(field.max_len) + '字符)' : '')" :disabled="true"></el-input>
							</el-form-item>
						</div>
					</que-edit-panel>							
				</template>
				<template v-else-if="field.type === _QUE_TYPE.CHECKBOX"><!--多选框-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false" :disableControl="false" minLenString="最少选项数" maxLenString="最多选项数">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-checkbox-group>
									<template v-for="choice in field.content">
										<el-checkbox :label="choice" :disabled="true"></el-checkbox>
									</template>
								</el-checkbox-group>
								<template v-if="field.min_len <= field.max_len">
									<font color="blue"><i>请选择{{ field.min_len }}至{{ field.max_len }}个选项</i></font>
								</template>
							</el-form-item>
						</div>
						<div slot="slotControl">
							<template v-for="(item, index2) in field.content ">
								<el-row>
									<el-col :offset="1" :span="4">
										选项{{ index2 + 1 }}：
									</el-col>
									<el-col :span="15">
										<el-input placeholder="请输入内容" v-model="getFields[index].content[index2]"></el-input>
									</el-col>
									<el-col :offset="1" :span="1">
										<el-button type="warning" size="small" @click="deleteQueOption({index1: index, index2: index2})">删除选项</el-button>
									</el-col>
								</el-row>
							</template>
							<el-row>
								<el-col :offset="1">
									<el-button type="warning" size="small" @click="addQueOption(index)">添加选项</el-button>
								</el-col>
							</el-row>
						</div>
					</que-edit-panel>							
				</template>
				<template v-else-if="field.type === _QUE_TYPE.RATIO"><!--单选框-->
					<que-edit-panel :index="index" :disableMoveUp="index === 0" :disableMoveDown="index === getFields.length - 1" :disableDelete="false" :disableRequired="false" :disableDescription="false" :disableControl="false">
						<div slot="slotPreivew">
							<el-form-item :label="field.description" :required="field.required">
								<el-radio-group :disabled="true">
									<template v-for="choice in field.content">
										<el-radio :label="choice"></el-radio>
									</template>
								</el-radio-group>
							</el-form-item>		
						</div>
						<div slot="slotControl">
							<template v-for="(item, index2) in field.content ">
								<el-row>
									<el-col :offset="1" :span="4">
										选项{{ index2 + 1 }}：
									</el-col>
									<el-col :span="15">
										<el-input placeholder="请输入内容" v-model="getFields[index].content[index2]"></el-input>
									</el-col>
									<el-col :offset="1" :span="1">
										<el-button type="warning" size="small" @click="deleteQueOption({index1: index, index2: index2})">删除选项</el-button>
									</el-col>
								</el-row>
							</template>
							<el-row>
								<el-col :offset="1">
									<el-button type="warning" size="small" @click="addQueOption(index)">添加选项</el-button>
								</el-col>
							</el-row>
						</div>
					</que-edit-panel>							
				</template>
				<hr />
			</template>
			<el-row>
				<b>添加题目</b>
			</el-row>
			<el-row>
				<el-col :offset="1" :span="4">
					类别：
				</el-col>
				<el-col :span="19">
					<el-select v-model="newQue.type" placeholder="请选择类别">
						<el-option label="说明文字" :value="1"> </el-option>
						<el-option label="数字" :value="2"> </el-option>
						<el-option label="邮箱" :value="3"> </el-option>
						<el-option label="手机" :value="4"> </el-option>
						<el-option label="单行字符串" :value="5"> </el-option>
						<el-option label="多行字符串" :value="6"> </el-option>
						<el-option label="多选框" :value="7"> </el-option>
						<el-option label="单选框" :value="8"> </el-option>
						<el-option label="附件说明" :value="9"> </el-option>
						<el-option label="上传附件" :value="10"> </el-option>
					</el-select>
				</el-col>
			</el-row>
			<el-row>
				<el-col :offset="1">
					<el-button type="warning" size="small" @click="_addQue()">添加</el-button>
				</el-col>
			</el-row>
		</el-form>
	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import QueType from "../../common/js/queType"

	export default {
		props: {
		},
		computed: {
			...mapGetters([
				"getForm",
				"getFields"
			]),
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			}
		},
		data() {
			return {				
				editFormRules: {
				},
				newQue: {
					type: 1,
					max_len: -1,
					min_len: 0,
					required: true,
					description: "",
					content: null
				}
			}
		},
		methods: {
			...mapActions([
				"deleteQueOption",
				"addQueOption",
				"addQue"
			]),
			_queTypeString: function(str) {
				return QueType.queTypeString(str);
			},
			_addQue: function() {
				var _newQue = JSON.parse(JSON.stringify(this.newQue));
				if (_newQue.type == this._QUE_TYPE.CHECKBOX || _newQue.type == this._QUE_TYPE.RATIO) {
					_newQue.content = [];
				}
				this.addQue(_newQue);
			}
		}
	}
</script>