<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item label="表单名字">
					<el-input v-model="filters.name" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="表单类别" prop="type">
					<el-select v-model="filters.type" placeholder="类别">
						<el-option label="所有" value=""></el-option>
						<template v-for="type in _FORM_TYPE">
							<el-option :label="_formTypeString(type)" :value="type"></el-option>
						</template>
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
		<el-table :data="forms" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;" border>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column label="#" width="60">
				<template scope="scope">
					{{ (currentPage - 1) * pageSize + scope.$index + 1 }}
				</template>
			</el-table-column>
			<el-table-column prop="name" label="表单名" width="220" sortable>
			</el-table-column>
			<el-table-column prop="type" label="类别" width="180" :formatter="typeFormatter" sortable>
			</el-table-column>
			<el-table-column label="操作" width="200">
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
			<el-pagination layout="prev, pager, next" @current-change="allCurrentChange" :page-size="pageSize" :total="total" style="float:right;" :current-page.sync="currentPage">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" size="large">
			<form-edit></form-edit>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleEditSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="编辑" v-model="addFormVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" size="large">
			<form-edit></form-edit>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleAddSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>		

		<!--预览界面-->
		<el-dialog title="预览" v-model="previewFormVisible" :close-on-click-modal="false" size="large">
			<form-view></form-view>
		</el-dialog>

	</section>
</template>

<script>
	import { apiGetFormList, apiUpdateForm, apiAddForm, apiDeleteForm } from "../../api/api"
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"
	import QueType from "../../common/js/queType"
	import FormType from "../../common/js/formType"

	export default {
		computed: {
			...mapGetters([
				"getForm",
				"getFields",
				"getFill"
			]),
			_QUE_TYPE: function() {
				return QueType.QUE_TYPE;
			},
			_FORM_TYPE: function() {
				return FormType.FORM_TYPE;
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

				forms: [],
				total: 0,
				pageSize: 20,
				currentPage: 1
			}
		},
		methods: {
			_formTypeString: function(str) {
				return FormType.formTypeString(str);
			},
			allSearch: function() {
				this.currentPage = 1;
				this.getFormList();
			},
			allAdd: function() {
				this.setForm({
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
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					var tasks = [];
					for (var i in this.sels) {
						tasks.push(apiDeleteForm(this.sels[i].id));
					}
					Promise.all(tasks).then(reses => {
						this.$notify({
							title: "删除成功",
							message: "批量删除表单成功",
							type: "success"
						});
						this.getFormList();
					}).catch(errors => {
						this.$notify({
							title: "删除失败",
							message: "批量删除表单失败",
							type: "error"
						});
						this.getFormList();
					});
				}).catch(() => {
				});
			},
			allCurrentChange: function (val) {
				this.getFormList();
			},
			singleDel: function (index, row) {
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					apiDeleteForm(row.id).then(res => {
						this.$notify({
							title: "删除成功",
							message: "删除表单成功",
							type: "success"
						});
						this.getFormList();
					}).catch(error => {
						this.$notify({
							title: "删除失败",
							message: "删除表单失败",
							type: "error"
						});	
					});
				}).catch(() => {
				});
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
					if (field.type === this._QUE_TYPE.CHECKBOX || field.type === this._QUE_TYPE.TABLE) {
						fill["data" + i] = [];
					} else {
						fill["data" + i] = null;
					}
				}
				this.setFill(fill);
				this.previewFormVisible = true;
			},
			singleEditSubmit: function() {
				var form = this.getForm;
				var id = form.id;
				apiUpdateForm(id, form).then(res => {
					this.$notify({
						title: "更新成功",
						message: "更新表单信息成功",
						type: "success"
					});
					this.editFormVisible = false;
					this.getFormList();
				}).catch(error => {
					this.$notify({
						title: "更新失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "更新失败",
						message: "请检查网络连接",
						type: "error"
					});	
				});
			},
			singleAddSubmit: function() {
				var form = this.getForm;
				apiAddForm(form).then(res => {
					this.$notify({
						title: "新增成功",
						message: "新增表单成功",
						type: "success"
					});
					this.addFormVisible = false;
					this.getFormList();					
				}).catch(error => {
					this.$notify({
						title: "新增失败",
						message: error.response.data.message,
						type: "error"
					});
				}).catch(error => {
					this.$notify({
						title: "新增失败",
						message: "请检查网络连接",
						type: "error"
					});	
				});
			},
			typeFormatter: function (row, column) {
				return this._formTypeString(row.type);
			},
			getFormList: function () {
				this.listLoading = true;
				var params = {
					page: this.currentPage,
					pageSize: this.pageSize
				};
				if (this.filters.name != "") {
					params["name"] = this.filters.name;
				}
				if (this.filters.type != "") {
					params["type"] = this.filters.type;
				}
				apiGetFormList(params).then(res => {
					this.forms = res.data.data;
					this.total = res.data.pagination.rowCount;
					this.listLoading = false;
					//console.log(this.forms);
				}).catch(error => {
					this.$notify({
						title: "加载失败",
						message: error.response.data.message,
						type: "error"
					});
					this.listLoading = false;
				});
			},
			...mapActions([
				"setForm",
				"setFill"
			])
		},
		mounted() {
			this.getFormList();
		}
	}

</script>

<style scoped>

</style>