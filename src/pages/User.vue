<template>
	<el-form ref="form" :model="form" :rules="rules" label-width="80px" @submit.prevent="onSubmit" style="margin:20px;width:60%;min-width:600px;">
		<el-form-item label="姓名">
			<el-input v-model="form.name" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="学号">
			<el-input v-model="form.studentId" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="班级">
			<el-input v-model="form.class" :readonly="true"></el-input>
		</el-form-item>
		<el-form-item label="年级">
			<el-input v-model="form.grade" :readonly="true"></el-input>
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
	export default {
		data() {
			var validatePhone = (rule, value, callback) => {
				var re = /^1\d{10}$/;
				if (!re.test(value)) {
					callback(new Error('请输入正确的电话号码'));
				} else {
					callback();
				}
			};

			var validateEmail = (rule, value, callback) => {
				var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
				if (!re.test(value)) {
					callback(new Error('请输入正确的邮箱'));
				} else {
					callback();
				}
			};

			var validatePass = (rule, value, callback) => {
				if (this.form.dupPass !== '') {
					this.$refs.form.validateField('dupPass');
				}
				callback();
			};

			var validateDupPass = (rule, value, callback) => {
				if (this.form.pass !== '' && value === '') {
					callback(new Error('请再次输入密码'));
				} else if (value !== this.form.pass) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			}

			return {
				form: {
					name: '林梓楠',
					studentId: '2013011217',
					class: '无37',
					grade: '2013',
					phone: '18800182102',
					email: 'linzinan1995@126.com'
				},
				rules: {
					phone: [
						{ validator: validatePhone, trigger: 'blur' }
					],
					email: [
						{ validator: validateEmail, trigger: 'blur' }
					],
					pass: [
						{ validator: validatePass, trigger: 'blur' }
					],
					dupPass: [
						{ validator: validateDupPass, trigger: 'blur' }
					]
				}
			}
		},
		methods: {
			onSubmit() {
				console.log('submit!');
			}
		}		
	}

</script>

<style scoped>

</style>