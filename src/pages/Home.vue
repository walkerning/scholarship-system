<template>
	<el-row class="container">
		<el-col :span="24" class="header">
			<el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				{{collapsed?"":sysName}}
			</el-col>
			<el-col :span="10">
				<div class="tools" @click.prevent="collapse">
					<i class="fa fa-align-justify"></i>
				</div>
			</el-col>
			<el-col :span="4" class="userinfo">
				<el-dropdown trigger="click">
					<span class="el-dropdown-link userinfo-inner">{{sysUserName}}</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item @click.native="userinfo">用户信息</el-dropdown-item>
						<el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
						<el-dropdown-item divided @click.native="aboutVisible=true">关于</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
		</el-col>
		<el-col :span="24" class="main">
			<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
				<!--导航菜单-->
				<el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleopen" @close="handleclose" @select="handleselect"
					 unique-opened router v-show="!collapsed">
					<template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
						<el-submenu :index="index+''" v-if="!item.leaf&&hasPermission(item.permission)">
							<template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
							<el-menu-item v-for="child in item.children" :index="child.path" v-if="!child.hidden&&hasPermission(child.permission)">{{child.name}}</el-menu-item>
						</el-submenu>
						<el-menu-item v-if="item.leaf&&item.children.length>0&&hasPermission(item.permission)" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item>
					</template>
				</el-menu>
				<!--导航菜单-折叠后-->
				<ul class="el-menu el-menu-vertical-demo collapsed" v-show="collapsed" ref="menuCollapsed">
					<li v-for="(item,index) in $router.options.routes" v-if="!item.hidden" class="el-submenu item">
						<template v-if="!item.leaf">
							<div class="el-submenu__title" style="padding-left: 20px;" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"><i :class="item.iconCls"></i></div>
							<ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"> 
								<li v-for="child in item.children" v-if="!child.hidden" class="el-menu-item" style="padding-left: 40px;" :class="$route.path==child.path?'is-active':''" @click="$router.push(child.path)">{{child.name}}</li>
							</ul>
						</template>
						<template v-else>
							<li class="el-submenu">
								<div class="el-submenu__title el-menu-item" style="padding-left: 20px;height: 56px;line-height: 56px;padding: 0 20px;" :class="$route.path==item.children[0].path?'is-active':''" @click="$router.push(item.children[0].path)"><i :class="item.iconCls"></i></div>
							</li>
						</template>
					</li>
				</ul>
			</aside>
			<section class="content-container">
				<div class="grid-content bg-purple-light">
					<el-col :span="24" class="breadcrumb-container">
						<strong class="title">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper">
						<transition>
							<router-view></router-view>
						</transition>
					</el-col>
				</div>
			</section>
		</el-col>
		<el-dialog title="清华电子奖学金系统" size="small" v-model="aboutVisible">
			<hr />
			<b>顾问</b>
			<ul>
				<li><a style="color:green;" href="http://nics.ee.tsinghua.edu.cn/people/wangyu/index.html" target="_blank">汪玉</a></li>
				<li><a style="color:green;" href="http://oa.ee.tsinghua.edu.cn/~shenyuan/" target="_blank">沈渊</a></li>
			</ul>
			<b>策划</b>
			<ul>
				<li><a style="color:green;" href="#">徐晗 清华大学电子工程系本科生工作助理</a></li>
				<li><a style="color:green;" href="#">王超 清华大学电子工程系2015级研究生、辅导员</a></li>
			</ul>
			<b>开发者</b>
			<ul>
				<li><a style="color:green;" href="mailto:linzinan1995@126.com">林梓楠 清华大学电子工程系2013级本科生 </a></li>
				<li><a style="color:green;" href="mailto:foxdoraame@gmail.com">宁雪妃 清华大学电子工程系2016级研究生 </a></li>
				<li><a style="color:green;" href="mailto:huangzc13@mails.tsinghua.edu.cn">黄志超 清华大学电子工程系2013级本科生 </a></li>
				<li><a style="color:green;" href="mailto:975114697@qq.com">许璀杰 清华大学电子工程系2016级本科生 </a></li>
			</ul>
			<hr />
			<b>奖学金、荣誉申请问题请联系辅导员，系统bug请联系开发者</b>
			<hr />
			Powered by <a href="https://github.com/taylorchen709/vue-admin" target="_blank">vue-admin</a>, <a href="https://cn.vuejs.org/" target="_blank">Vue.js</a> and <a href="http://element.eleme.io/#/zh-CN" target="_blank">Element UI</a>.
		</el-dialog>
	</el-row>
</template>

<script>
	import { apiGetUser, apiLogout } from "../api/api";
	export default {
		data() {
			return {
				sysName: "清华电子奖学金系统",
				collapsed:  false,
				sysUserName: "",
				aboutVisible: false,
				sysUserPermissions: []
			}
		},
		methods: {
			handleopen() {
				//console.log('handleopen');
			},
			handleclose() {
				//console.log('handleclose');
			},
			handleselect: function (a, b) {
			},
			//退出登录
			logout: function () {
				this.$confirm("确认退出吗?", "提示").then(() => {
					apiLogout();
					this.$router.push({ path: "/login" });
				}).catch(error => {
					console.log(error);
				});
			},
			//折叠导航栏
			collapse:function(){
				this.collapsed=!this.collapsed;
			},
			showMenu(i,status){
				this.$refs.menuCollapsed.getElementsByClassName("submenu-hook-"+i)[0].style.display=status?"block":"none";
			},
			userinfo: function () {
				this.$router.push("/user");
			},
			hasPermission: function(requiredPermissions) {
				for (var i in requiredPermissions) {
					if (requiredPermissions[i] == null || _.includes(this.sysUserPermissions, requiredPermissions[i])) {
						return true;
					}
				}
				return false;
			}
		},
		mounted() {
			var user = JSON.parse(sessionStorage.getItem("user"));
			this.sysUserName = user.name;
			this.sysUserPermissions = user.permissions;
		}
	}

</script>

<style scoped lang="scss">
	.container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: #20a0ff;//#20a0ff
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}
			.logo {
				//width:230px;
				height:60px;
				font-size: 22px;
				padding-left:15px;
				padding-right:15px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 40px;
					float: left;
					margin: 10px 10px 10px 18px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:230px;
			}
			.logo-collapse-width{
				width:60px
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			// background: #324057;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 230px;
				width: 230px;
				// position: absolute;
				// top: 0px;
				// bottom: 0px;
				.el-menu{
					height: 100%;
				}
				.collapsed{
					width:60px;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}

				}
			}
			.menu-collapsed{
				flex:0 0 60px;
				width: 60px;
			}
			.menu-expanded{
				flex:0 0 230px;
				width: 230px;
			}
			.content-container {
				// background: #f1f2f7;
				flex:1;
				// position: absolute;
				// right: 0px;
				// top: 0px;
				// bottom: 0px;
				// left: 230px;
				overflow-y: scroll;
				padding: 20px;
				.breadcrumb-container {
					//margin-bottom: 15px;
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
					box-sizing: border-box;
				}
			}
		}
	}
</style>
