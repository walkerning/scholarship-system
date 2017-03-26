<template>
	<section>
		<!--列表-->
		<el-table :data="scholarships" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="奖学金名" width="220" sortable>
			</el-table-column>
			<el-table-column prop="year" label="年份" width="150" sortable>
			</el-table-column>
			<el-table-column prop="state" label="状态" :formatter="stateFormatter" width="150" sortable>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<template v-if="scope.row.fill_id === null">
						<el-button type="info" size="small" @click="singleFill(scope.$index, scope.row)" :disabled="scope.row.state !== 'success'">填写感谢信</el-button>
					</template>
					<template v-if="scope.row.fill_id !== null">
						<el-button size="small" @click="singleView(scope.$index, scope.row)">查看感谢信</el-button>
					</template>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="allCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--查看界面-->
		<el-dialog title="查看" v-model="viewVisible">
			<form-view :disabled="true"></form-view>
		</el-dialog>

		<!--填写界面-->
		<el-dialog title="填写" v-model="fillVisible">
			<form-view></form-view>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="fillVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleFillSubmit" :loading="fillLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import QueType from "../common/js/queType"

	export default {
		computed: {
			...mapGetters([
				"getForm",
				"getFields",
				"getFill"
			]),
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			}
		},
		data() {
			return {
				listLoading: false,
				scholarships: [
					{
						id: 1,
						name: "国家奖学金",
						year: "2017",
						form_id: 6,
						state: "success",
						fill_id: 10
					},
					{
						id: 2,
						name: "本科生特等奖学金",
						year: "2018",
						form_id: 6,
						state: "fail",
						fill_id: null
					},
					{
						id: 3,
						name: "研究生特等奖学金",
						year: "2017",
						form_id: 7,
						state: "success",
						fill_id: null
					},
					{
						id: 2,
						name: "一二九奖学金",
						year: "2015",
						form_id: 7,
						state: "fail",
						fill_id: 11
					}
				],
				total: 4,

				testForm: {
					id: "1",
					name: "测试表单1",
					type: "apply",
					fields: [
						{
							type: 1,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "说明文字",
							content: null
						},
						{
							type: 2,
							max_len: 1267,
							min_len: 1200,
							required: false,
							description: "数字（有限制、可选）",
							content: null
						},
						{
							type: 2,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "数字（无限制、必选）",
							content: null
						},
						{
							type: 3,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "邮箱（无限制、必选）",
							content: null
						},
						{
							type: 4,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "手机（无限制、必选）",
							content: null
						},
						{
							type: 5,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "单行字符串（无限制、必选）",
							content: null
						},
						{
							type: 5,
							max_len: 100,
							min_len: 1,
							required: false,
							description: "单行字符串（有限制、可选）",
							content: null
						},
						{
							type: 6,
							max_len: -1,
							min_len: 0,
							required: true,
							description: "多行字符串（无限制、必选）",
							content: null
						},
						{
							type: 6,
							max_len: 100,
							min_len: 1,
							required: false,
							description: "多行字符串（有限制、可选）",
							content: null
						},
						{
							type: 7,
							max_len: 2,
							min_len: 1,
							required: false,
							description: "多选框（有限制、可选）",
							content: ["A", "B", "C"]
						},
						{
							type: 7,
							max_len: 2,
							min_len: 1,
							required: true,
							description: "多选框（有限制、必选）",
							content: ["A", "B", "C"]
						},
						{
							type: 8,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "单选框（可选）",
							content: ["A", "B", "C"]
						},
						{
							type: 9,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "附件说明",
							content: 1
						},
						{
							type: 10,
							max_len: -1,
							min_len: -1,
							required: false,
							description: "上传附件（无限制、可选）",
							content: null
						},
						{
							type: 10,
							max_len: -1,
							min_len: 10000,
							required: true,
							description: "上传附件（有限制、必选）",
							content: null
						}
					],
					template: "<latex></latex>"
				},
				testFill: {
					data0: "",
					data1: "1200",
					data2: "100",
					data3: "linzinan1995@126.com",
					data4: "18800182102",
					data5: "test",
					data6: "test2",
					data7: "test\ntest",
					data8: "",
					data9: [],
					data10: ["A", "B"],
					data11: "A"
				},

				viewVisible: false,
				fillVisible: false,
				fillLoading: false,

				sels: [],//列表选中列
			}
		},
		methods: {
			allSelsChange: function (sels) {
				this.sels = sels;
			},
			singleFill: function (index, row) {
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				var fill = {};
				for (var i in this.getFields) {
					var field = this.getFields[i];
					if (field.type === this._QUE_TYPE.CHECKBOX) {
						fill["data" + i] = [];
					} else {
						fill["data" + i] = null;
					}
				}
				this.setFill(fill);
				this.fillVisible = true;
			},
			singleView: function (index, row) {
				this.setForm(JSON.parse(JSON.stringify(this.testForm)));
				this.setFill(JSON.parse(JSON.stringify(this.testFill)));
				this.viewVisible = true;
			},
			stateFormatter: function (row, column) {
				return row.state === "success" ? "已获得" : "未获得";
			},
			allCurrentChange: function (val) {

			},
			singleFillSubmit: function () {

			},
			...mapActions([
				"setForm",
				"setFill"
			])
		}
	}

</script>

<style scoped>

</style>