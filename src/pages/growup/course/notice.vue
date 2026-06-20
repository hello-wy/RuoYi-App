<template>
	<NoticeConfirm
		title="报名须知"
		:sections="sections"
		agreement-text="我已阅读学优职傢的《报名须知》和《预定住宿须知》"
		confirm-text="我同意"
		@confirm="handleAgree"
	/>
</template>

<script>
import NoticeConfirm from '@/components/NoticeConfirm/index.vue'

export default {
	components: { NoticeConfirm },
	data() {
		return {
			courseId: '',
			sections: [
				{
					title: '报名须知',
					content: `尊敬的学员您好：\n欢迎您参加学优职傢的课程，为了您有更好的学习体验，请在仔细阅读须知后再报名。\n\n一、课程选择：\n1、在首页选择您想要报名参加的课程；\n2、如需了解自己的学籍情况，可点击右下角"我的"里面进行查看。\n\n二、报名操作：\n1、小程序首页选择您要参加的课程并点击；\n2、进入课程报名页面后会您的学籍数量提示，在有学籍的情况下，点击"前往报名"；\n3、阅读完须知后勾选我已阅读，并点击"我同意"进行下一步；\n4、在报名页面核对您的报名信息，点击"立即报名"；\n5、进行报名押金支付，支付成功后即报名成功。\n\n三、报名押金：\n1、为防止虚假报名影响课程开设，有些课程报名设置了押金，完成支付方可报名成功；\n2、距开课42小时前可以取消报名，取消后押金自动退还，距开课42小时内不能取消退还；\n3、现场扫码签到，经审核后报名押金会退还至支付账户。\n\n四、现场签到：\n1、现场签到时请根据工作人员的指引有序排队签到；\n2、签到前请您提前准备好出示签到二维码；\n3、签到二维码在小程序首页右下角"我的"→"我的课程"→"现场签到"即可查看。\n再次感谢您的关注和参与，如报名操作遇到有问题，请随时与我们联系。`
				},
				{
					title: '预定住宿须知',
					content: `尊敬的学员您好：\n课程学习的强度较大需要充足的休息，为保持良好的学习状态，同时方便和同学交流，建议您全程住在开课酒店。您可以选择自己在网上预定酒店，也可以选择通过厚德预定（按照厚德协议价办理入住）。如您选择通过我们预定酒店，请您仔细阅读以下预定住宿须知。`
				}
			]
		}
	},
	onLoad(options) {
		this.courseId = options.id || options.courseId || ''
	},
	methods: {
		handleAgree() {
			uni.navigateTo({
				url: `/pages/growup/course/enroll?id=${this.courseId}`
			})
		}
	}
}
</script>

