<template>
	<span>
		<template v-if="applyStatus === _APPLY_STATUS.SUCCESS">
			<el-tag type="success"> {{ _applyStatusString(applyStatus) }} </el-tag>
		</template>
		<template v-else-if="applyStatus === _APPLY_STATUS.FAIL">
			<el-tag type="danger"> {{ _applyStatusString(applyStatus) }} </el-tag>
		</template>
		<template v-else-if="applyStatus === _APPLY_STATUS.APPLIED">
			<el-tag type="primary"> {{ _applyStatusString(applyStatus) }} </el-tag>
		</template>	
		<template v-else-if="applyStatus === _APPLY_STATUS.TEMP">
			<el-tag type="gray"> {{ _applyStatusString(applyStatus) }} </el-tag>
		</template>		
	</span>
</template>

<script>
	import ApplyStatus from "../../common/js/applyStatus"

	export default {
		computed: {
			_APPLY_STATUS: function() {
				return ApplyStatus.APPLY_STATUS;
			}
		},
		props: {
			applyStatus: {
				type: String,
				required: true
			}
		},
		methods: {
			_applyStatusString: function(str) {
				return ApplyStatus.applyStatusString(str);
			}
		}
	}
</script>