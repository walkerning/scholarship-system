<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="表单名字"></el-input>
				</el-form-item>
				<el-form-item label="" prop="type">
					<el-select v-model="filters.type" placeholder="类别">
						<el-option label="荣誉申请" value="apply"></el-option>
						<el-option label="感谢信" value="thanks"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="allSearch">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="allAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="forms" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="表单名" width="220" sortable>
			</el-table-column>
			<el-table-column prop="type" label="类别" width="180" :formatter="typeFormatter" sortable>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="singleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="info" size="small" @click="singlePreview(scope.$index, scope.row)">预览</el-button>
					<el-button type="danger" size="small" @click="singleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="allBatchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="allCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<form-edit></form-edit>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleEditSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="编辑" v-model="addFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
			<form-edit></form-edit>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleAddSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>		

		<!--预览界面-->
		<el-dialog title="预览" v-model="previewFormVisible" :close-on-click-modal="false">
			<form-view></form-view>
		</el-dialog>

	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import QueType from "../../common/js/queType"

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
				filters: {
					name: "",
					type: ""
				},
				listLoading: false,

				editFormVisible: false,
				editLoading: false,

				addFormVisible: false,
				addLoading: false,

				previewFormVisible: false,

				sels: [],//列表选中列

				forms: [
					{
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
						template: ""
					},
					{
						id: 2,
						name: "测试表单2",
						type: "thanks",
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
							}
						],
						template: "<latex></latex>"
					}
				],
				total: 2
			}
		},
		methods: {
			allSearch: function() {

			},
			allAdd: function() {
				this.setForm({
					id: -1,
					name: "未命名表单",
					type: "apply",
					fields: [],
					template: ""
				});
				this.addFormVisible = true;
			},
			allSelsChange: function (sels) {
				this.sels = sels;
			},
			allBatchRemove: function () {
				
			},
			allCurrentChange: function (val) {

			},
			singleDel: function (index, row) {

			},
			singleEdit: function (index, row) {
				this.setForm(JSON.parse(JSON.stringify(row)));
				this.editFormVisible = true;
			},
			singlePreview: function (index, row) {
				this.setForm(JSON.parse(JSON.stringify(row)));
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
				this.previewFormVisible = true;
			},
			singleEditSubmit: function() {

			},
			singleAddSubmit: function() {

			},
			typeFormatter: function (row, column) {
				return row.type === "apply" ? "荣誉申请表" : "奖学金感谢信表";
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