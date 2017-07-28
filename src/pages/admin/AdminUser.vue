<template>
	
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.group" placeholder="年级"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.student_id" placeholder="学号或工作证号"></el-input>
				</el-form-item>
				<el-form-item>
					<el-checkbox v-model="filters.admin">管理员</el-checkbox>
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
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="allSelsChange" style="width: 100%;" border>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="姓名" width="120" sortable>
			</el-table-column>
			<el-table-column prop="student_id" label="学号或工作证号" width="160" sortable>
			</el-table-column>
			<el-table-column prop="class" label="班级" width="100" sortable>
			</el-table-column>
			<el-table-column prop="group" label="年级" width="120" sortable>
			</el-table-column>
			<el-table-column prop="type" label="类别" width="120" :formatter="typeFormatter" sortable>
			</el-table-column>
			<el-table-column label="操作" width="140">
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
				<el-form-item label="学号或工作证号" prop="student_id">
					<el-input v-model="editForm.student_id" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级" prop="class">
					<el-input v-model="editForm.class" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级" prop="group">
					<el-input v-model="editForm.group" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类别" prop="type">
					<el-select v-model="editForm.type">
						<template v-for="userType in _USER_TYPE">
							<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="editForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="GPA" prop="gpa">
					<el-input v-model="editForm.gpa" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级排名" prop="class_rank">
					<el-input v-model="editForm.class_rank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级排名" prop="year_rank">
					<el-input v-model="editForm.year_rank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="权限" prop="permissions">
					<el-checkbox-group v-model="editForm.permissions">
						<template v-for="permissionType in _PERMISSION_TYPE">
							<el-checkbox :label="permissionType">{{ _permissionTypeString(permissionType) }}</el-checkbox>
						</template>
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
				<el-form-item label="学号或工作证号" prop="student_id">
					<el-input v-model="addForm.student_id" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级" prop="class">
					<el-input v-model="addForm.class" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级" prop="group">
					<el-input v-model="addForm.group" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类别" prop="type">
					<el-select v-model="addForm.type">
						<template v-for="userType in _USER_TYPE">
							<el-option :label="_userTypeString(userType)" :value="userType"></el-option>
						</template>
					</el-select>
				</el-form-item>
				<el-form-item label="电话" prop="phone">
					<el-input v-model="addForm.phone" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="GPA" prop="gpa">
					<el-input v-model="addForm.gpa" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="班级排名" prop="class_rank">
					<el-input v-model="addForm.class_rank" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="年级排名" prop="year_rank">
					<el-input v-model="addForm.year_rank" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="singleAddSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--导入界面-->
		<el-dialog title="导入" v-model="importFormVisible" :close-on-click-modal="false">
			<el-form :model="importForm" label-width="20px" ref="importForm">
				<h4> 导入新用户 </h4>
				选择Excel(.xlsx)文件，文件内只有一个sheet，每一行包含一个用户的信息，各列分别为：[姓名]、[学号]、[班级]、[年级]、[类别（undergraduate or graduate）]、[电话]、[邮箱]
				<el-form-item label="" prop="userFile">
					<!-- <el-input type="file" v-model="importForm.userFile" auto-complete="off"></el-input> -->
					<input type="file" id="importFormUserFile" />  				
				</el-form-item>
				<el-button type="primary" @click.native="allImportUser" :loading="importLoading">上传</el-button>
			</el-form>
			<hr />
			<el-form :model="importForm" label-width="20px" ref="importForm">
				<h4> 导入成绩 </h4>
				选择Excel(.xlsx)文件，文件内只有一个sheet，每一行包含一个用户的信息，各列分别为：[学号]、[GPA]、[班级排名]、[年级排名]
				<el-form-item label="" prop="scoreFile">
					<!-- <el-input type="file" v-model="importForm.scoreFile" auto-complete="off"></el-input> -->
					<input type="file" id="importFormScoreFile" />
				</el-form-item>
				<el-button type="primary" @click.native="allImportScore" :loading="importLoading">上传</el-button>
			</el-form>
		</el-dialog>

		<!--导入反馈界面-->
		<el-dialog title="导入反馈" v-model="importFormFeedbackVisible" :close-on-click-modal="false" size="large">
			<el-table :data="importFormFeedback" strip style="width: 100%;">
				<el-table-column type="index" width="60"> </el-table-column>
				<el-table-column prop="name" label="姓名" width="120"> </el-table-column>
				<el-table-column prop="student_id" label="学号" width="150" sortable> </el-table-column>
				<el-table-column prop="class" label="班级" width="100" sortable> </el-table-column>
				<el-table-column prop="group" label="年级" width="120" sortable> </el-table-column>
				<el-table-column prop="type" label="类别" width="120" :formatter="typeFormatter" sortable> </el-table-column>
				<el-table-column prop="status" label="导入状态" sortable> </el-table-column>
			</el-table>
		</el-dialog>



	</section>
</template>

<script>
	import _ from "lodash"
	import { apiGetUserList, apiUpdateUser, apiAddUser, apiGetGroupId, apiDeleteUser, apiResetPassword, apiAddPermissionUser, apiDeletePermissionUser } from "../../api/api"
	import UserType from "../../common/js/userType"
	import PermissionType from "../../common/js/permissionType"
	export default {
		computed: {
			_USER_TYPE: function() {
				return UserType.USER_TYPE;
			},
			_PERMISSION_TYPE: function() {
				return PermissionType.PERMISSION_TYPE;
			}
		},
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

			var validateInteger = (rule, value, callback) => {
				if (value && value !== "") {
					var a = parseInt(value);
					if (a.toString() !== value) {
						callback(new Error("请输入整数"));
						return;
					}
				}
				callback();
			};

			var validateFloat = (rule, value, callback) => {
				if (value && value !== "") {
					var a = parseFloat(value);
					if (a.toString() !== value) {
						callback(new Error("请输入数字"));
						return;
					}
				}
				callback();
			};

			return {
				filters: {
					name: "",
					group: "",
					student_id: "",
					admin: false
				},
				listLoading: false,

				editFormVisible: false,
				editLoading: false,

				addFormVisible: false,
				addLoading: false,

				importFormVisible: false,
				importLoading: false,
				importFormFeedbackVisible: false,

				sels: [],//列表选中列
				
				importFormFeedback: [],
				users: [],
				total: 0,

				importForm: {
					userFile: "",
					scoreFile: ""
				},

				addForm: {
					name: "",
					student_id: "",
					class: "",
					group: "",
					type: "",
					phone: "",
					email: "",
					gpa: null,
					class_rank: null,
					year_rank: null
				},
				addFormRules: {
					name: [ 
						{ required: true, message: "请输入姓名", trigger: "change"}
					],
					student_id: [ 
						{ required: true, message: "请输入学号或工作证号", trigger: "change"}
					],
					class: [ 
						{ required: true, message: "请输入班级", trigger: "change"}
					],
					group: [ 
						{ required: true, message: "请输入年级", trigger: "change"}
					],
					type: [ 
						{ required: true, message: "请输入类别", trigger: "change"}
					],
					phone: [
						{ required: true, validator: validatePhone, trigger: "change" }
					],
					email: [
						{ required: true, validator: validateEmail, trigger: "change" }
					],
					gpa: [
						{ validator: validateFloat, trigger: "change" }
					],
					class_rank: [
						{ validator: validateInteger, trigger: "change" }
					],
					year_rank: [
						{ validator: validateInteger, trigger: "change" }
					]
				},

				editForm: {
					name: "",
					student_id: "",
					class: "",
					group: "",
					type: null,
					phone: "",
					email: "",
					gap: null,
					class_rank: null,
					year_rank: null,
					permissions: []
				},
				editFormOldPermission: [],
				editFormRules: {
					name: [ 
						{ required: true, message: "请输入姓名", trigger: "change"}
					],
					student_id: [ 
						{ required: true, message: "请输入学号或工作证号", trigger: "change"}
					],
					class: [ 
						{ required: true, message: "请输入班级", trigger: "change"}
					],
					group: [ 
						{ required: true, message: "请输入年级", trigger: "change"}
					],
					type: [ 
						{ required: true, message: "请输入类别", trigger: "change"}
					],
					phone: [
						{ required: true, validator: validatePhone, trigger: "change" }
					],
					email: [
						{ required: true, validator: validateEmail, trigger: "change" }
					],
					gpa: [
						{ validator: validateFloat, trigger: "change" }
					],
					class_rank: [
						{ validator: validateInteger, trigger: "change" }
					],
					year_rank: [
						{ validator: validateInteger, trigger: "change" }
					]
				}
			}
		},
		methods: {
			allSearch: function () {
				this.getUserList();
			},
			allAdd: function () {
				this.addFormVisible = true;
			},
			allImport: function () {
				this.importFormVisible = true;
			},
			allImportUser: function () {
				var reader, workbook, file, sheet, row, that;
				that = this;
				file = document.getElementById("importFormUserFile").files[0];
				reader = new FileReader;				
				reader.readAsDataURL(file);				
				reader.onload = function(e)
				{
					workbook = new wijmo.xlsx.Workbook();
					workbook.load(reader.result);				
					sheet = workbook._sheets[0];	
					that.importFormFeedback = [];
					for (let i=0, il=sheet._rows.length; i<il; i++)
					{
						row = sheet._rows[i];
						if (row == undefined) break;
						if (row._cells == undefined) break;
						//console.log("i= " + i);
						(function(row_) {
							var params = {
								name: row_._cells[0].value,
								student_id: row_._cells[1].value+'',
								class: row_._cells[2].value,
								group: row_._cells[3].value,
								type: row_._cells[4].value,
								phone: row_._cells[5].value+'',
								email: row_._cells[6].value
							};		
							apiGetGroupId(row_._cells[3].value+'', row_._cells[4].value+'').then(group_id => {
								params.group_id = group_id;
								//console.log(params);
								apiAddUser(params).then(res => {
									params.status = "导入成功";
									that.getUserList();
									that.importFormFeedback.push(params);
								}).catch(error => {
									//console.log(error);
									params.status = "导入失败，" + error.response.data.message;
									that.importFormFeedback.push(params);
								}).catch(error => {
									params.status = "导入失败，请检查网络"; 
									that.importFormFeedback.push(params);
								});	
							}).catch(error => {
								//console.log(error.response);
								params.status = "导入失败，获取group_id失败";
								that.importFormFeedback.push(params);
							});;
						})(row);
					}
					that.importFormVisible = false;
					that.importFormFeedbackVisible = true;
				};
			},			
			allImportScore: function () {
				var reader, workbook, file, sheet, row, that;
				that = this;
				file = document.getElementById("importFormScoreFile").files[0];
				reader = new FileReader;				
				reader.readAsDataURL(file);				
				reader.onload = function(e)
				{
					workbook = new wijmo.xlsx.Workbook();
					workbook.load(reader.result);				
					sheet = workbook._sheets[0];	
					that.importFormFeedback = [];
					for (let i=0, il=sheet._rows.length; i<il; i++)
					{
						//console.log(i + ' ' + il);
						row = sheet._rows[i];
						if (row == undefined) break;
						if (row._cells == undefined) break;
						(function(row_) {			
							var str = "";
							for (let k=0, kl=row_._cells.length; k<kl; k++)
								str += row_._cells[k].value+"  ";
							//console.log(str);
							apiGetUserList({student_id: row_._cells[0].value}).then(res => {
								var user = res.data[0];
								//console.log("user: " + user);
								if (user == undefined) {
									user.student_id = row_._cells[0].value;
									user.status = "导入失败，该学生不存在";
									that.importFormFeedback.push(user);
								}else {
									var params = {
										id: user.id,
										name: user.name,
										student_id: user.student_id,
										class: user.class,
										group_id: user.group_id,
										type: user.type,
										phone: user.phone,
										email: user.email
									};
									var uid = user.id;
									params.gpa = row_.cells[1].value;
									params.class_rank = row_._cells[2].value;
									params.year_rank = row_._cells[3].value;
									//console.log("uid: ", uid);
									//console.log("importScore update: ", params);

									apiUpdateUser(uid, params).then(res => {
										user.status = "导入成功";
										that.getUserList();
										that.importFormFeedback.push(user);
									}).catch(error => {
										user.status = "导入失败";
										//console.log("failed in apiUpdateUser: " + error);
										that.importFormFeedback.push(user);
									}).catch(error => {
										user.status = "导入失败，请检查网络连接";
										that.importFormFeedback.push(user);
									});	
								}
							}).catch(error => {
								var user = {
									student_id: row_._cells[0].value,
									status: "导入失败，该学生不存在"
								};
								//console.log("failed in apiFindUser: " + error);
								that.importFormFeedback.push(user);
							});
						})(row);
					}
					that.importFormVisible = false;
					that.importFormFeedbackVisible = true;
				};
			},
			allBatchRemove: function () {
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					var tasks = [];
					for (var i in this.sels) {
						tasks.push(apiDeleteUser(this.sels[i].id));
					}
					Promise.all(tasks).then(reses => {
						this.$notify({
							title: "删除成功",
							message: "批量删除用户成功",
							type: "success"
						});
						this.getUserList();
					}).catch(error => {
						this.$notify({
							title: "删除失败",
							message: "批量删除用户失败",
							type: "error"
						});
						this.getUserList();
					});
				}).catch(() => {
				});
			},
			allSelsChange: function (sels) {
				this.sels = sels;
			},
			allCurrentChange: function(val) {

			},
			singleDel: function (index, row) {
				this.$confirm("确定删除？", "提示", {confirmButtonText: "确定", cancelButtonText: "取消", type: "warning"}).then(() => {
					apiDeleteUser(row.id).then(res => {
						this.$notify({
							title: "删除成功",
							message: "删除用户成功",
							type: "success"
						});
						this.getUserList();
					}).catch(error => {
						this.$notify({
							title: "删除失败",
							message: "删除用户失败",
							type: "error"
						});	
					});
				}).catch(() => {
				});
			},
			singleEdit: function (index, row) {
				//console.log(this.users[6].id);
				this.editForm = JSON.parse(JSON.stringify(row));
				if (this.editForm.hasOwnProperty("gpa")) {
					this.editForm.gpa = this.editForm.gpa.toString();
				}
				if (this.editForm.hasOwnProperty("class_rank")) {
					this.editForm.class_rank = this.editForm.class_rank.toString();
				}
				if (this.editForm.hasOwnProperty("year_rank")) {
					this.editForm.year_rank = this.editForm.year_rank.toString();
				}
				this.editFormOldPermission = row.permissions;
				this.editFormVisible = true;
			},
			singleEditSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						apiGetGroupId(this.editForm.group, this.editForm.type).then(group_id => {
							var uid = this.editForm.id;
							var params = {
								name: this.editForm.name,
								student_id: this.editForm.student_id,
								class: this.editForm.class,
								group_id: group_id,
								type: this.editForm.type,
								phone: this.editForm.phone,
								email: this.editForm.email
							};
							if (this.editForm.gpa && this.editForm.gpa !== "") {
								params.gpa = parseFloat(this.editForm.gpa);
							}
							if (this.editForm.class_rank && this.editForm.class_rank !== "") {
								params.class_rank = parseInt(this.editForm.class_rank);
							}
							if (this.editForm.year_rank && this.editForm.year_rank != "") {
								params.year_rank = parseInt(this.editForm.year_rank);
							}
							var tasks = []
							tasks.push(apiUpdateUser(uid, params));
							for (var i in this.editFormOldPermission) {
								if (_.indexOf(this.editForm.permissions, this.editFormOldPermission[i]) == -1) {
									tasks.push(apiDeletePermissionUser(this.editFormOldPermission[i], uid));
								}
							}
							for (var i in this.editForm.permissions) {
								if (_.indexOf(this.editFormOldPermission, this.editForm.permissions[i]) == -1) {
									tasks.push(apiAddPermissionUser(this.editForm.permissions[i], uid));
								}
							}
							Promise.all(tasks).then(reses => {
								this.$notify({
									title: "更新成功",
									message: "更新用户信息成功",
									type: "success"
								});
								this.editFormVisible = false;
								this.getUserList();
							}).catch(error => {
								//console.log(error);
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
						}).catch(error => {
							//console.log(error);
							this.$notify({
								title: "更新失败",
								message: "获取组id失败",
								type: "error"
							});	
						});
					}
				})
			},
			singleResetPasswd: function () {
				var uid = this.editForm.id;
				apiResetPassword(uid).then(() => {
					this.$notify({
						title: "重设密码成功",
						message: "重设密码成功。新密码已发送至该用户邮箱！",
						type: "success"
					});
				}).catch(error => {
					this.$notify({
						title: "重设密码失败",
						message: "重设密码失败",
						type: "error"
					});
				})
			},
			singleAddSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						apiGetGroupId(this.addForm.group, this.addForm.type).then(group_id => {
							var params = {
								name: this.addForm.name,
								student_id: this.addForm.student_id,
								class: this.addForm.class,
								group_id: group_id,
								type: this.addForm.type,
								phone: this.addForm.phone,
								email: this.addForm.email
							};
							if (this.addForm.gpa && this.addForm.gpa !== "") {
								params.gpa = parseFloat(this.addForm.gpa);
							}
							if (this.addForm.class_rank && this.addForm.class_rank !== "") {
								params.class_rank = parseInt(this.addForm.class_rank);
							}
							if (this.addForm.year_rank && this.addForm.year_rank != "") {
								params.year_rank = parseInt(this.addForm.year_rank);
							}
							apiAddUser(params).then(res => {
								this.$notify({
									title: "新增成功",
									message: "新增用户成功",
									type: "success"
								});
								this.addFormVisible = false;
								this.getUserList();
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
						}).catch(error => {
							this.$notify({
								title: "新增失败",
								message: "获取组id失败",
								type: "error"
							});	
						});;
					}
				})
			},
			typeFormatter: function (row, column) {
				return UserType.userTypeString(row.type);
			},
			getUserList: function () {
				this.listLoading = true;
				var params = {};
				if (this.filters.name != "") {
					params["name"] = this.filters.name;
				}
				if (this.filters.group != "") {
					params["group"] = this.filters.group;
				}
				if (this.filters.student_id != "") {
					params["student_id"] = this.filters.student_id;
				}
				if (this.filters.admin) {
					params["admin"] = 1;
				}
				apiGetUserList(params).then(res => {
					this.users = res.data;
					this.listLoading = false;
					this.total = this.users.length;
				}).catch(error => {
					this.$notify({
						title: "加载用户列表失败",
						message: error.response.data.message,
						type: "error"
					});
					this.listLoading = false;
				}).catch(error => {
					this.$notify({
						title: "加载用户列表失败",
						message: "请检查网络连接",
						type: "error"
					});
					this.listLoading = false;					
				});
			},
			_userTypeString: function(type) {
				return UserType.userTypeString(type);
			},
			_permissionTypeString: function(type) {
				return PermissionType.permissionTypeString(type);
			}
		},
		mounted() {
			this.getUserList();
		}
	}

</script>

<style scoped>

</style>
