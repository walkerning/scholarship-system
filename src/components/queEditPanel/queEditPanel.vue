<template>
	<section>
		<el-row>
			<el-col :offset="1">
				<el-button type="info" size="small" @click="moveUpQue(index)" :disabled="disableMoveUp">上移</el-button>
				<el-button type="info" size="small" @click="moveDownQue(index)" :disabled="disableMoveDown">下移</el-button>
				<el-button type="danger" size="small" @click="deleteQue(index)" :disabled="disableDelete">删除</el-button>
			</el-col>
		</el-row>
		<el-row v-if="!disableRequired">
			<el-col :offset="1">
				<el-checkbox v-model="getFields[index].required">是否必答</el-checkbox>
			</el-col>
		</el-row>
		<el-row v-if="minLenString !== null || maxLenString !== null">
			<div v-if="minLenString !== null">
				<el-col :offset="1" :span="4">
					{{ minLenString }}：
				</el-col>
				<el-col :span="5">
					<el-input-number size="small" v-model="getFields[index].min_len"></el-input-number>
				</el-col>
			</div>
			<div v-if="maxLenString !== null">
				<el-col :offset="1" :span="4">
					{{ maxLenString }}：
				</el-col>
				<el-col :span="5">
					<el-input-number size="small" v-model="getFields[index].max_len"></el-input-number>
				</el-col>
			</div>
			<div v-show="getFields[index].min_len > getFields[index].max_len">
				<el-col :offset="1" :span="3">
					<font color="red">最小>最大表示无限制</font>
				</el-col>
			</div>
		</el-row>
		<el-row v-if="!disableDescription">
			<el-col :offset="1" :span="4">
				说明文字：
			</el-col>
			<el-col :span="19">
				<el-input type="textarea" autosize placeholder="" v-model="getFields[index].description"></el-input>
			</el-col>
		</el-row>

		<el-row v-if="!disableControl">
			<div class="control">
				<slot name="slotControl">
				</slot>
			</div>
		</el-row>

		<el-row v-if="!disablePreview">
			<div class="preview">
				<slot name="slotPreivew">
				</slot>
			</div>
		</el-row>

	</section>
</template>

<script>
	import { mapGetters } from "vuex"
	import { mapActions } from "vuex"

	export default {
		props: {
			index: Number,
			disableMoveUp: Boolean,
			disableMoveDown: Boolean,
			disableDelete: Boolean,
			disableRequired: Boolean,
			disableDescription: Boolean,
			disablePreview: {
				type: Boolean,
				default: false
			},
			disableControl: {
				type: Boolean,
				default: true
			},
			minLenString: {
				type: String,
				default: null
			},
			maxLenString: {
				type: String,
				default: null
			}
		},
		computed: {
			...mapGetters([
				"getForm",
				"getFields"
			])
		},
		data() {
			return {

			}
		},
		methods: {
			...mapActions([
				"moveUpQue",
				"moveDownQue",
				"deleteQue"
			])
		}
	}
</script>