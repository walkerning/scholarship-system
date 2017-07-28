<template>
	<el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.prevent="onSubmit" style="margin:20px;width:60%;min-width:600px;" v-loading="formLoading">
		<el-form-item label="姓名">
			<el-input v-model="form.name" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="学号或工作证号">
			<el-input v-model="form.student_id" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="班级">
			<el-input v-model="form.class" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="年级">
			<el-input v-model="form.group" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="类别">
			<el-input v-model="_type" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="电话" prop="phone">
			<el-input v-model="form.phone"></el-input>
		</el-form-item>
		<el-form-item label="邮箱" prop="email">
			<el-input v-model="form.email"></el-input>
		</el-form-item>
		<el-form-item label="修改密码（不修改则放空）" prop="pass">
			<el-input type="password" v-model="form.pass" auto-complete="off"></el-input>
		</el-form-item>
		<el-form-item label="确认密码" prop="dupPass">
			<el-input type="password" v-model="form.dupPass" auto-complete="off"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="onSubmit">修改</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	import { apiGetUser, apiUpdateUser, apiLogout } from "../api/api"
	import UserType from "../common/js/userType"
	export default {
		data() {
			var validatePhone = (rule, value, callback) => {
				var re = /^1\d{10}$/;
				if (value != "" && value != null && !re.test(value)) {
					callback(new Error("请输入正确的电话号码"));
				} else {
					callback();
				}
			};

			var validateEmail = (rule, value, callback) => {
				var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
				if (value != "" && value != null && !re.test(value)) {
					callback(new Error("请输入正确的邮箱"));
				} else {
					callback();
				}
			};

			var validatePass = (rule, value, callback) => {
				if (this.form.dupPass !== "") {
					this.$refs.form.validateField("dupPass");
				}
				callback();
			};

			var validateDupPass = (rule, value, callback) => {
				if (this.form.pass !== "" && value === "") {
					callback(new Error("请再次输入密码"));
				} else if (value !== this.form.pass) {
					callback(new Error("两次输入密码不一致!"));
				} else {
					callback();
				}
			}

			return {
				form: {
					name: "",
					student_id: "",
					class: "",
					type: "",
					group: "",
					phone: "",
					email: "",
					pass: "",
					dupPass: ""
				},
				formLoading: false,
				rules: {
					phone: [
						{ validator: validatePhone, trigger: "change" }
					],
					email: [
						{ validator: validateEmail, trigger: "change" }
					],
					pass: [
						{ validator: validatePass, trigger: "blur" }
					],
					dupPass: [
						{ validator: validateDupPass, trigger: "blur" }
					]
				}
			}
		},
		methods: {
			onSubmit() {
				this.$refs.form.validate((valid) => {
					if (valid) {
						var uid = sessionStorage.getItem("uid");
						var params = {
							phone: this.form.phone,
							email: this.form.email
						};
						if (this.form.pass != "") {
							params["password"] = this.form.pass;
						}
						apiUpdateUser(uid, params).then(res => {
							this.$notify({
								title: "更新成功",
								message: "更新个人信息成功",
								type: "success"
							});
							if (params.password != undefined) {
								this.$notify({
									title: "重新登录",
									message: "已修改密码，请重新登录",
									type: "info"
								});
								apiLogout();
								this.$router.push({ path: "/login" });
								return;
							}
							this.getUser();
						}).catch(error => {
							this.$notify({
								title: "更新失败",
								message: error.response.data.message,
								type: "error"
							});
						});
					}
				})
			},
			getUser() {
				var uid = sessionStorage.getItem("uid");
				this.formLoading = true;
				apiGetUser(uid).then(res => {
					this.form = res.data;
					this.formLoading = false;
				}).catch(error => {
					this.$notify({
						title: "加载用户信息失败",
						message: "加载用户信息失败",
						type: "error"
					});
					this.formLoading = false;
				});
			}
		},
		computed: {
			_type: function() {
				return UserType.userTypeString(this.form.type);
			}
		},
		mounted() {
			this.getUser();
		}
	}

</script>

<style scoped>

</style>