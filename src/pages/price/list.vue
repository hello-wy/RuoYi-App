<template>
	<view class="price-page">
		<!-- 服务须知 -->
		<view class="section notice-section">
			<view class="section-title">服务须知:</view>
			<view class="notice-content">
				<text class="notice-item">1、学优职傢网从数万教员库择优为您服务。</text>
				<text class="notice-item">2、在教员前去执教前,学优职傢网会对教员进行严格认证。</text>
				<text class="notice-item">3、本站对教员所做的每一份家教都有详细记录,供家长/学员选择教员时参考。</text>
				<text class="notice-item">4、家教课时费建议<text class="highlight">上门次结一次,勿提前预支</text>,以免引起不必要的纠纷。</text>
				<view class="notice-item">
					<text>5、如有任何疑问</text>
					<view class="hotline-btn" @click="callHotline">拨打热线</view>
				</view>
			</view>
		</view>

		<!-- 教员课时费参考标准 -->
		<view class="section standard-section">
			<view class="section-title">教员课时费参考标准:</view>
			<view class="tips-content">
				<text class="tips-text">特别提示:本价格为付给教员的参考价格,具体价格需学优职傢网的工作人员与学员(家长)协商,根据</text>
				<text class="highlight">路程、课程难易、对教员的水平要求、是否全英文授课、是否付给车贴等因素</text>
				<text class="tips-text">而定。此价格默认的不付给教员车贴。</text>
			</view>
		</view>

		<!-- 1、文化类 -->
		<view class="section table-section">
			<view class="category-title">1、文化类 (元/每小时)</view>
			<view class="price-table">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">学前/小学</view>
					<view class="table-cell">初中</view>
					<view class="table-cell">高中</view>
				</view>
				<view class="table-row">
					<view class="table-cell">大学生</view>
					<view class="table-cell">60-90</view>
					<view class="table-cell">70-100</view>
					<view class="table-cell">80-120</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业老师</view>
					<view class="table-cell">100-150</view>
					<view class="table-cell">120-250</view>
					<view class="table-cell">180-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">英文版教材</view>
					<view class="table-cell full-width" colspan="3">在以上的基础上有增加</view>
				</view>
				<view class="table-row">
					<view class="table-cell">网络课程</view>
					<view class="table-cell full-width" colspan="3">网络订单相比一对一上门家教,费用降低20%-30%,具体可商议。</view>
				</view>
			</view>
		</view>

		<!-- 2、才艺运动类 -->
		<view class="section table-section">
			<view class="category-title">2、才艺运动类 (元/每节课或每小时)</view>
			
			<!-- 钢琴/小提琴/声乐等 -->
			<view class="price-table">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">钢琴/小提琴/声乐等</view>
				</view>
				<view class="table-row">
					<view class="table-cell">业余8级以上</view>
					<view class="table-cell">100-150</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业大学生</view>
					<view class="table-cell">120-250</view>
				</view>
				<view class="table-row">
					<view class="table-cell">上音专业大学生</view>
					<view class="table-cell">180-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业音乐老师</view>
					<view class="table-cell">200-400</view>
				</view>
			</view>

			<!-- 美术/艺术/体育棋类 -->
			<view class="price-table mt-10">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">美术/艺术/体育棋类</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业大学生</view>
					<view class="table-cell">80-200</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业老师</view>
					<view class="table-cell">120-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">网络课程</view>
					<view class="table-cell">网络订单相比一对一上门家教,费用降低20%-30%,具体可商议。</view>
				</view>
			</view>
		</view>

		<!-- 3、语言留学类 -->
		<view class="section table-section">
			<view class="category-title">3、语言留学类 (元/每小时)</view>
			
			<!-- 成人英语/口语/留学等 -->
			<view class="price-table">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">成人英语/口语/留学等</view>
				</view>
				<view class="table-row">
					<view class="table-cell">大学生</view>
					<view class="table-cell">60-150</view>
				</view>
				<view class="table-row">
					<view class="table-cell">英语专业大学生</view>
					<view class="table-cell">80-200</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业老师</view>
					<view class="table-cell">120-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">海外归国人员</view>
					<view class="table-cell">150-300</view>
				</view>
			</view>

			<!-- 小语种 -->
			<view class="price-table mt-10">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">小语种 (法/德/韩等)</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业大学生</view>
					<view class="table-cell">100-150</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业老师</view>
					<view class="table-cell">150-200</view>
				</view>
				<view class="table-row">
					<view class="table-cell">海外归国人员</view>
					<view class="table-cell">150-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">网络课程</view>
					<view class="table-cell">网络订单相比一对一上门家教,费用降低20%-30%,具体可商议。</view>
				</view>
			</view>
		</view>

		<!-- 4、大学课程、计算机、考研类 -->
		<view class="section table-section">
			<view class="category-title">4、大学课程、计算机、考研类 (元/每小时)</view>
			<view class="price-table">
				<view class="table-row header-row">
					<view class="table-cell"></view>
					<view class="table-cell">大学课程/计算机/考研</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业大学生</view>
					<view class="table-cell">80-200</view>
				</view>
				<view class="table-row">
					<view class="table-cell">专业老师</view>
					<view class="table-cell">150-300</view>
				</view>
				<view class="table-row">
					<view class="table-cell">网络课程</view>
					<view class="table-cell">网络订单相比一对一上门家教,费用降低20%-30%,具体可商议。</view>
				</view>
			</view>
			<view class="ps-text">PS: ★明星教员价格对应以上会适当提高。</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'PriceList',
	data() {
		return {
			hotlinePhone: '17327736231'
		}
	},
	methods: {
		callHotline() {
			uni.makePhoneCall({
				phoneNumber: this.hotlinePhone,
				success: () => {
					console.log('拨打热线成功');
				},
				fail: () => {
					uni.showToast({
						title: '拨打失败',
						icon: 'error'
					});
				}
			});
		}
	}
}
</script>

<style scoped>
.price-page {
	min-height: 100vh;
	background-color: #F5F5F5;
	padding: 15px;
}

.section {
	background-color: #fff;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 15px;
}

.section-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
	margin-bottom: 12px;
}

/* 服务须知 */
.notice-content {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.notice-item {
	font-size: 14px;
	color: #666;
	line-height: 22px;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}

.highlight {
	color: #FF6600;
	font-weight: 500;
}

.hotline-btn {
	display: inline-block;
	background-color: #FF6600;
	color: #fff;
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 14px;
	margin-left: 8px;
	cursor: pointer;
}

/* 标准说明 */
.tips-content {
	font-size: 14px;
	color: #666;
	line-height: 22px;
}

.tips-text {
	color: #666;
}

/* 分类标题 */
.category-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 12px;
}

/* 表格样式 */
.price-table {
	border: 1px solid #E0E0E0;
	border-radius: 4px;
	overflow: hidden;
}

.mt-10 {
	margin-top: 15px;
}

.table-row {
	display: flex;
	border-bottom: 1px solid #E0E0E0;
}

.table-row:last-child {
	border-bottom: none;
}

.header-row {
	background-color: #F8F8F8;
}

.header-row .table-cell {
	font-weight: bold;
	color: #333;
}

.table-cell {
	flex: 1;
	padding: 10px 8px;
	font-size: 13px;
	color: #666;
	text-align: center;
	border-right: 1px solid #E0E0E0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.table-cell:last-child {
	border-right: none;
}

.full-width {
	flex: 3;
	text-align: left;
	padding-left: 12px;
}

/* PS说明 */
.ps-text {
	font-size: 13px;
	color: #666;
	margin-top: 10px;
	padding-left: 5px;
}
</style>
