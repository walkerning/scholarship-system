<template>
	<el-form :model="loginForm" :rules="rules" ref="loginForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
		<h3 class="title">系统登录</h3>
		<el-form-item prop="student_id">
			<el-input type="text" v-model="loginForm.student_id" auto-complete="off" placeholder="学号"></el-input>
		</el-form-item>
		<el-form-item prop="password">
			<el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"></el-input>
		</el-form-item>
		<el-form-item style="width:100%;">
			<el-button type="primary" style="width:100%;" @click.native.prevent="doLogin" :loading="logining">登录</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	import { apiRequestLogin, apiLogin } from '../api/api';
	import NProgress from 'nprogress'
	export default {
		data() {
			return {
				logining: false,
				loginForm: {
					student_id: "",
					password: ""
				},
				rules: {
					student_id: [
						{ required: true, message: '请输入学号', trigger: 'blur' },
					],
					password: [
						{ required: true, message: '请输入密码', trigger: 'blur' },
					]
				}
			};
		},
		methods: {
			doLogin() {
				this.$refs.loginForm.validate((valid) => {
					if (valid) {
						this.logining = true;
						NProgress.start();
						var loginParams = { student_id: this.loginForm.student_id, password: this.loginForm.password };
						apiRequestLogin(loginParams).then(res => {
							this.logining = false;
							NProgress.done();
							if (res.data.token != undefined) {
								apiLogin(res.data)
								this.$router.push({ path: '/user' });
							} else {
								this.$notify({
									title: "登录失败",
									message: "未知错误",
									type: "error"
								});
							}
						}).catch(error => {
							this.logining = false;
							NProgress.done();
							this.$notify({
								title: "登录失败",
								message: error.response.data.message,
								type: "error"
							});
						}).catch(error => {
							this.logining = false;
							NProgress.done();
							this.$notify({
								title: "登录失败",
								message: "请检查网络连接",
								type: "error"
							});	
						});
					} else {
						return;
					}
				});
			}
		}
	}

</script>

<style lang="scss" scoped>
	.login-container {
		/*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
		-webkit-border-radius: 5px;
		border-radius: 5px;
		-moz-border-radius: 5px;
		background-clip: padding-box;
		margin: 180px auto;
		width: 350px;
		padding: 35px 35px 15px 35px;
		background: #fff;
		border: 1px solid #eaeaea;
		box-shadow: 0 0 25px #cac6c6;
		.title {
			margin: 0px auto 40px auto;
			text-align: center;
			color: #505458;
		}
		.remember {
			margin: 0px 0px 35px 0px;
		}
	}
</style>