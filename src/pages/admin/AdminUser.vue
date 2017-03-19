<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.grade" placeholder="年级"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.studentId" placeholder="学号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="allSearch">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="allAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="allImport">导入</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="120" sortable>
			</el-table-column>
			<el-table-column prop="studentId" label="学号" width="150" sortable>
			</el-table-column>
			<el-table-column prop="class" label="班级" width="100" sortable>
			</el-table-column>
			<el-table-column prop="group" label="年级" width="120" sortable>
			</el-table-column>
			<el-table-column prop="type" label="类别" width="120" :formatter="typeFormatter" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template scope="scope">
					<el-button size="small" @click="singleEdit(scope.$index, scope.row)">编辑</el-button>
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
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="学号" prop="studentId">
					<el-input v-model="editForm.studentId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级" prop="class">
					<el-input v-model="editForm.class" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级" prop="group">
					<el-input v-model="editForm.group" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类别" prop="type">
					<el-select v-model="editForm.type">
						<el-option label="本科生" value="undergraduate"></el-option>
						<el-option label="研究生" value="graduate"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="editForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="GPA" prop="gpa">
					<el-input v-model.number="editForm.gpa" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级排名" prop="classRank">
					<el-input v-model.number="editForm.classRank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级排名" prop="yearRank">
					<el-input v-model.number="editForm.yearRank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="权限" prop="permission">
					<el-checkbox-group v-model="editForm.permission">
						<el-checkbox label="login">有效</el-checkbox>
						<el-checkbox label="user">用户管理</el-checkbox>
						<el-checkbox label="form">表单管理</el-checkbox>
						<el-checkbox label="scholarship">奖学金管理</el-checkbox>
						<el-checkbox label="honor">荣誉管理</el-checkbox>
						<el-checkbox label="export">学校奖助系统对接</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="singleResetPasswd" type="danger">重置密码</el-button>
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleEditSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="姓名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="学号" prop="studentId">
					<el-input v-model="addForm.studentId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级" prop="class">
					<el-input v-model="addForm.class" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级" prop="group">
					<el-input v-model="addForm.group" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类别" prop="type">
					<el-select v-model="addForm.type">
						<el-option label="本科生" value="undergraduate"></el-option>
						<el-option label="研究生" value="graduate"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="addForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="GPA" prop="gpa">
					<el-input v-model.number="addForm.gpa" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级排名" prop="classRank">
					<el-input v-model.number="addForm.classRank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级排名" prop="yearRank">
					<el-input v-model.number="addForm.yearRank" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleAddSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<el-dialog title="导入" v-model="importFormVisible" :close-on-click-modal="false">
			<el-form :model="importForm" label-width="20px" ref="importForm">
				<h4> 导入新用户 </h4>
				选择Excel(.xlsx)文件，文件内只有一个sheet，每一行包含一个用户的信息，各列分别为：[姓名]、[学号]、[班级]、[年级]、[类别（本科生or研究生）]、[电话]、[邮箱]
				<el-form-item label="" prop="userFile">
				<el-input type="file" v-model="importForm.userFile" auto-complete="off"></el-input>
				</el-form-item>
				<el-button type="primary" @click.native="allImportUser" :loading="importLoading">上传</el-button>
			</el-form>
			<hr />
			<el-form :model="importForm" label-width="20px" ref="importForm">
				<h4> 导入成绩 </h4>
				选择Excel(.xlsx)文件，文件内只有一个sheet，每一行包含一个用户的信息，各列分别为：[学号]、[GPA]、[班级排名]、[年级排名]
				<el-form-item label="" prop="scoreFile">
				<el-input type="file" v-model="importForm.scoreFile" auto-complete="off"></el-input>
				</el-form-item>
				<el-button type="primary" @click.native="allImportScore" :loading="importLoading">上传</el-button>
			</el-form>
		</el-dialog>

	</section>
</template>

<script>
	export default {
		data() {
			var validatePhone = (rule, value, callback) => {
				var re = /^1\d{10}$/;
				if (!re.test(value)) {
					callback(new Error("请输入正确的电话号码"));
				} else {
					callback();
				}
			};

			var validateEmail = (rule, value, callback) => {
				var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
				if (!re.test(value)) {
					callback(new Error("请输入正确的邮箱"));
				} else {
					callback();
				}
			};

			return {
				filters: {
					name: "",
					grade: "",
					studentId: ""
				},
				listLoading: false,

				editFormVisible: false,
				editLoading: false,

				addFormVisible: false,
				addLoading: false,

				importFormVisible: false,
				importLoading: false,

				sels: [],//列表选中列

				users: [ 
					{ 
						id: 1, name: "林梓楠", studentId: "2013011217", class: "无37", group: "2013", type: "undergraduate", phone: "18800182102", email: "linzinan1995@126.com", gpa: 93.6, classRank: 1, yearRank: 2, permission: ["login", "user", "form", "scholarship", "honor", "export"] 
					}, 
					{ 
						id: 2, name: "林梓楠2", studentId: "2013011218", class: "无30", group: "2017", type: "graduate", phone: "18800182103", email: "linzn13@mails.tsinghua.edu.cn", gpa: 93.5, classRank: 2, yearRank: 2, permission: ["login"] 
					}
				],
				total: 1,

				importForm: {
					userFile: "",
					scoreFile: ""
				},

				addForm: {
					name: "",
					studentId: "",
					class: "",
					group: "",
					type: "",
					phone: "",
					email: "",
					gap: null,
					classRank: null,
					yearRank: null
				},
				addFormRules: {
					name: [ 
						{ required: true, message: "请输入姓名", trigger: "blur"}
					],
					studentId: [ 
						{ required: true, message: "请输入学号", trigger: "blur"}
					],
					class: [ 
						{ required: true, message: "请输入班级", trigger: "blur"}
					],
					group: [ 
						{ required: true, message: "请输入年级", trigger: "blur"}
					],
					type: [ 
						{ required: true, message: "请输入类别", trigger: "blur"}
					],
					phone: [
						{ required: true, validator: validatePhone, trigger: "blur" }
					],
					email: [
						{ required: true, validator: validateEmail, trigger: "blur" }
					],
					gpa: [
						{ type: "number", message: "请输入正确的GPA", trigger: "blur" }
					],
					classRank: [
						{ type: "number", message: "请输入正确的班级排名", trigger: "blur" }
					],
					yearRank: [
						{ type: "number", message: "请输入正确的年级排名", trigger: "blur" }
					]
				},

				editForm: {
					name: "",
					studentId: "",
					class: "",
					group: "",
					type: null,
					phone: "",
					email: "",
					gap: null,
					classRank: null,
					yearRank: null
				},
				editFormRules: {
					name: [ 
						{ required: true, message: "请输入姓名", trigger: "blur"}
					],
					studentId: [ 
						{ required: true, message: "请输入学号", trigger: "blur"}
					],
					class: [ 
						{ required: true, message: "请输入班级", trigger: "blur"}
					],
					group: [ 
						{ required: true, message: "请输入年级", trigger: "blur"}
					],
					type: [ 
						{ required: true, message: "请输入类别", trigger: "blur"}
					],
					phone: [
						{ required: true, validator: validatePhone, trigger: "blur" }
					],
					email: [
						{ required: true, validator: validateEmail, trigger: "blur" }
					],
					gpa: [
						{ type: "number", message: "请输入正确的GPA", trigger: "blur" }
					],
					classRank: [
						{ type: "number", message: "请输入正确的班级排名", trigger: "blur" }
					],
					yearRank: [
						{ type: "number", message: "请输入正确的年级排名", trigger: "blur" }
					]
				}
			}
		},
		methods: {
			allSearch() {

			},
			allAdd() {
				this.addFormVisible = true;
			},
			allImport() {
				this.importFormVisible = true;
			},
			allImportUser() {

			},
			allImportScore() {

			},
			allBatchRemove: function () {
				
			},
			allSelsChange: function (sels) {
				this.sels = sels;
			},
			allCurrentChange(val) {

			},
			singleDel: function (index, row) {

			},
			singleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			singleEditSubmit: function() {

			},
			singleResetPasswd: function() {

			},
			typeFormatter(row, column) {
				return row.type === "undergraduate" ? "本科生" : "研究生";
			}
		}
	}

</script>

<style scoped>

</style>