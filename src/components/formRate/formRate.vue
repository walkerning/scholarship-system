<template>
	<section>
		<el-table :data="getFields" highlight-current-row v-loading="rateTableLoading" @selection-change="allRateTableChange" style="width: 100%;" default-expand-all border>
			<el-table-column type="index" width="60" sortable>
			</el-table-column>
			<el-table-column prop="description" label="问题说明" width="250">
			</el-table-column>
			<el-table-column type="expand">
				<template scope="field">
					<el-form>
						<template v-if="field.row.type === _QUE_TYPE.ILLUSTRATION"> <!--说明文字-->
							该题目不用评分
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.NUMBER"><!--数字-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-input v-model="getFill['data' + field.$index]"  auto-complete="off" :readonly="readonly"></el-input>
							</el-form-item>
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.EMAIL"><!--邮箱-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-input v-model="getFill['data' + field.$index]" :readonly="readonly"></el-input>
							</el-form-item>					
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.PHONE"><!--手机-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-input v-model="getFill['data' + field.$index]" :readonly="readonly"></el-input>
							</el-form-item>								
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.STRING_SINGLE_LINE"><!--单行字符串-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-input v-model="getFill['data' + field.$index]" :readonly="readonly"></el-input>
							</el-form-item>
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.STRING_MULTIPLE_LINE"><!--多行字符串-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-input v-model="getFill['data' + field.$index]" type="textarea" autosize :readonly="readonly"></el-input>
							</el-form-item>						
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.CHECKBOX"><!--多选框-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-checkbox-group v-model="getFill['data' + field.$index]">
									<template v-for="choice in field.row.content">
										<el-checkbox :label="choice" :disabled="readonly"></el-checkbox>
									</template>
								</el-checkbox-group>
							</el-form-item>								
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.RATIO"><!--单选框-->
							<el-form-item :label="field.row.description" :required="field.row.required" :prop="'data' + field.$index">
								<el-radio-group v-model="getFill['data' + field.$index]">
									<template v-for="choice in field.row.content">
										<el-radio :label="choice" :disabled="readonly"></el-radio>
									</template>
								</el-radio-group>
							</el-form-item>							
						</template>
						<template v-else-if="field.row.type === _QUE_TYPE.TABLE"><!--表格-->
							<el-table :data="getFill['data' + field.$index]">
								<template v-for="(column, index2) in field.row.content">
									<el-table-column :label="column">
										<template scope="scope">
											<el-input type="textarea" autosize v-model="scope.row[index2]" :readonly="readonly"></el-input>
										</template>
									</el-table-column>
								</template>
							</el-table>
						</template>
					</el-form>
				</template>
			</el-table-column>
			<template v-for="(value, key, index) in getRate">
				<el-table-column :label="key === _UID? ('评分人' + (index + 1) + '(您)') : ('评分人' + (index + 1))">
					<template scope="scope">
						<el-input-number v-model="value[scope.$index]" :disabled="key !== _UID"></el-input-number>
					</template>
				</el-table-column>
			</template>
		</el-table>
		<template v-if="getRate[_UID] !== undefined">
			<el-button type="danger" @click.native="deleteRate(_UID)">删除您的评分</el-button>
		</template>
		<template v-else>
			<el-button type="primary" @click.native="addRateLocal">添加您的评分</el-button>
		</template>
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
				"getFields",
				"getFill",
				"getRate"
			]),
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			},
			_UID: function() {
				return sessionStorage.getItem('uid');
			}
		},
		data() {
			return {
				readonly: true,

				rateTableLoading: false,
				rateTableSels: []
			}
		},
		methods: {
			allRateTableChange: function (sels) {
				this.rateTableSels = sels;
			},
			addRateLocal: function () {
				var rate = [];
				for (var i = 0; i < this.getFields.length; i++) {
					rate.push(0);
				}
				this.addRate({ key: this._UID, value: rate });
			},
			...mapActions([
				"setFill",
				"addFillOption",
				"deleteFillOption",
				"setRate",
				"addRate",
				"setForm",
				"deleteRate"
			])
		}
	}
</script>