<template>
	<view class="page">
		<view class="page-body">
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap blue">
						<uni-icons type="person-filled" size="16" color="#3B82F6"></uni-icons>
					</view>
					<text class="section-title">基本信息</text>
				</view>

				<real-verify
					v-model:verified="verified"
					v-model:real-name="form.realName"
					v-model:id-card="form.idCard"
				></real-verify>

				<view class="form-item">
					<text class="form-label">身份</text>
					<view class="method-tags">
						<view
							v-for="item in identityOptions"
							:key="item.value"
							class="method-tag"
							:class="{ active: form.identity === item.value }"
							@click="selectIdentity(item.value)"
						>
							<text class="method-tag-text">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">城市</text>
					<input class="form-input" v-model="form.city" placeholder="例：江宁区" maxlength="15" />
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap green">
						<uni-icons type="staff-filled" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">学历信息</text>
				</view>

				<view class="form-item">
					<text class="form-label">就读/毕业学校</text>
					<input class="form-input" v-model="form.school" placeholder="例：北京大学" maxlength="50" />
				</view>

				<view class="form-item">
					<text class="form-label">专业名称</text>
					<input class="form-input" v-model="form.major" placeholder="例：数学与应用数学" maxlength="50" />
				</view>

				<view class="form-item">
					<text class="form-label">最高学历</text>
					<picker mode="selector" :range="dict.type.sys_degree" range-key="label" :value="degreeIndex" @change="onDegreeChange">
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.degree }">
								{{ getDegreeLabel(form.degree) || '请选择学历' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap orange">
						<uni-icons type="compose" size="16" color="#F59E0B"></uni-icons>
					</view>
					<text class="section-title">教学概况</text>
				</view>

				<view class="form-item">
					<view class="label-row">
						<text class="form-label">可教科目</text>
						<view class="add-btn" @click="openSubjectPopup">
							<uni-icons type="plusempty" size="14" color="#3B82F6"></uni-icons>
							<text class="add-btn-text">添加科目</text>
						</view>
					</view>
					<view class="subject-tags-wrap">
						<view v-for="(sub, index) in form.subjects" :key="index" class="subject-tag">
							<text class="subject-tag-text">{{ getSubjectLabel(sub) }}</text>
							<uni-icons type="closeempty" size="11" color="#3B82F6" @click="removeSubject(index)"></uni-icons>
						</view>
						<view v-if="form.subjects.length === 0" class="subject-empty">
							<text class="subject-empty-text">暂未添加科目，点击右侧添加</text>
						</view>
					</view>
				</view>

				<view class="form-item">
					<view class="label-row">
						<text class="form-label">可授课区域</text>
						<view class="add-btn" @click="openAreaPopup">
							<uni-icons type="plusempty" size="14" color="#3B82F6"></uni-icons>
							<text class="add-btn-text">添加区域</text>
						</view>
					</view>
					<view class="subject-tags-wrap">
						<view v-for="(code, index) in selectedAreaCodes" :key="index" class="subject-tag">
							<text class="subject-tag-text">{{ getAreaText(code) }}</text>
							<uni-icons type="closeempty" size="11" color="#3B82F6" @click="removeArea(index)"></uni-icons>
						</view>
						<view v-if="selectedAreaCodes.length === 0" class="subject-empty">
							<text class="subject-empty-text">暂未添加区域，点击右侧添加</text>
						</view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">授课方式</text>
					<view class="method-tags">
						<view
							v-for="item in dict.type.sys_methods"
							:key="item.value"
							class="method-tag"
							:class="{ active: form.methods === item.value }"
							@click="toggleMethod(item.value)"
						>
							<text class="method-tag-text">{{ item.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-item">
					<text class="form-label">教学经历</text>
					<textarea class="form-textarea" v-model="form.experience" placeholder="介绍您的教学经验、风格和特长优势..." maxlength="500" :show-confirm-bar="false"></textarea>
					<text class="word-count">{{ (form.experience || '').length }}/500</text>
				</view>
			</view>

			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap green">
						<uni-icons type="medal-filled" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">证书与自我评价</text>
				</view>

				<view class="form-item">
					<text class="form-label">证书</text>
					<textarea class="form-textarea" v-model="form.certificateList" placeholder="例：教师资格证、英语六级、普通话二甲" maxlength="300" :show-confirm-bar="false"></textarea>
					<text class="word-count">{{ (form.certificateList || '').length }}/300</text>
				</view>

				<view class="form-item">
					<text class="form-label">自我评价</text>
					<textarea class="form-textarea" v-model="form.selfJudge" placeholder="简单介绍一下您的个人特点和优势..." maxlength="300" :show-confirm-bar="false"></textarea>
					<text class="word-count">{{ (form.selfJudge || '').length }}/300</text>
				</view>
			</view>

			<view class="agree-row">
				<view class="agree-check" @click="agreed = !agreed">
					<view class="check-box" :class="{ checked: agreed }">
						<uni-icons v-if="agreed" type="checkmarkempty" size="12" color="#fff"></uni-icons>
					</view>
				</view>
				<text class="agree-text">我已阅读并同意</text>
				<text class="agree-link" @click="openAgreement">《家教入驻服务协议》</text>
			</view>

			<view class="submit-wrap">
				<view class="submit-btn" :class="{ disabled: submitting }" @click="handleSubmit">
					<text class="submit-text">{{ submitting ? '提交中...' : '提交申请' }}</text>
				</view>
				<text class="submit-hint">提交后平台将在 1-3 个工作日内完成审核</text>
			</view>
		</view>

		<view v-if="areaPopupVisible" class="picker-overlay" @touchmove.stop.prevent>
			<view class="picker-mask" :class="{ 'picker-mask--active': areaPopupShown }" @click="closeAreaPopup"></view>
			<view class="picker-sheet" :class="{ 'picker-sheet--active': areaPopupShown }">
				<view class="subject-popup">
					<view class="popup-header">
						<text class="popup-title">选择可授课区域</text>
						<view class="popup-close" @click="closeAreaPopup">
							<uni-icons type="closeempty" size="20" color="#666"></uni-icons>
						</view>
					</view>
					<view class="subject-grid">
						<view v-for="item in districtOptions" :key="item.value" class="subject-option" :class="{ 'subject-option-active': selectedAreaCodes.includes(item.value) }" @click="toggleArea(item.value)">
							<text class="subject-option-text">{{ item.text }}</text>
						</view>
					</view>
					<view class="popup-confirm-btn" @click="closeAreaPopup">
						<text class="popup-confirm-text">确定（已选 {{ selectedAreaCodes.length }} 项）</text>
					</view>
				</view>
			</view>
		</view>

		<view v-if="subjectPopupVisible" class="picker-overlay" @touchmove.stop.prevent>
			<view class="picker-mask" :class="{ 'picker-mask--active': subjectPopupShown }" @click="closeSubjectPopup"></view>
			<view class="picker-sheet" :class="{ 'picker-sheet--active': subjectPopupShown }">
				<view class="subject-popup">
					<view class="popup-header">
						<text class="popup-title">选择可教科目</text>
						<view class="popup-close" @click="closeSubjectPopup">
							<uni-icons type="closeempty" size="20" color="#666"></uni-icons>
						</view>
					</view>
					<view class="subject-grid">
						<view v-for="item in dict.type.sys_subject" :key="item.value" class="subject-option" :class="{ 'subject-option-active': form.subjects.includes(item.value) }" @click="toggleSubject(item.value)">
							<text class="subject-option-text">{{ item.label }}</text>
						</view>
					</view>
					<view class="popup-confirm-btn" @click="closeSubjectPopup">
						<text class="popup-confirm-text">确定（已选 {{ form.subjects.length }} 项）</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { addTutors } from '@/api/wxmini/tutoring'
import { useLocationStore } from '@/store'
import RealVerify from '@/components/RealVerify/RealVerify.vue'
import { removeAreaCodeAtIndex } from './apply.helpers'
import { tutorAgreementRoute } from './agreement.content'

export default {
	components: { RealVerify },
	dicts: ['sys_subject', 'sys_degree', 'sys_methods'],
	data() {
		return {
			verified: false,
			submitting: false,
			agreed: false,
			identityOptions: [
				{ label: '大学生教员', value: 0 },
				{ label: '在职教师', value: 1 },
				{ label: '其他', value: 2 }
			],
			form: {
				realName: '',
				idCard: '',
				identity: 0,
				city: '',
				school: '',
				major: '',
				degree: '',
				subjects: [],
				areas: '',
				methods: '',
				experience: '',
				certificateList: '',
				selfJudge: '',
				certificates: ''
			},
			degreeIndex: -1,
			selectedAreaCodes: [],
			areaPopupVisible: false,
			areaPopupShown: false,
			subjectPopupVisible: false,
			subjectPopupShown: false
		}
	},
	computed: {
		districtOptions() {
			return useLocationStore().districts
		}
	},
	methods: {
		openAreaPopup() {
			this.areaPopupVisible = true
			this.$nextTick(() => setTimeout(() => { this.areaPopupShown = true }, 30))
		},
		closeAreaPopup() {
			this.areaPopupShown = false
			setTimeout(() => { this.areaPopupVisible = false }, 300)
		},
		openSubjectPopup() {
			this.subjectPopupVisible = true
			this.$nextTick(() => setTimeout(() => { this.subjectPopupShown = true }, 30))
		},
		closeSubjectPopup() {
			this.subjectPopupShown = false
			setTimeout(() => { this.subjectPopupVisible = false }, 300)
		},
		selectIdentity(value) {
			this.form.identity = value
		},
		getSubjectLabel(val) {
			const item = (this.dict.type.sys_subject || []).find(o => o.value === val)
			return item ? item.label : val
		},
		getDegreeLabel(val) {
			const item = (this.dict.type.sys_degree || []).find(o => o.value === val)
			return item ? item.label : val
		},
		onDegreeChange(e) {
			this.degreeIndex = e.detail.value
			const opt = (this.dict.type.sys_degree || [])[e.detail.value]
			this.form.degree = opt ? opt.value : ''
		},
		getAreaText(code) {
			const item = this.districtOptions.find(o => o.value === code)
			return item ? item.text : code
		},
		toggleMethod(value) {
			this.form.methods = this.form.methods === value ? '' : value
		},
		toggleArea(code) {
			const idx = this.selectedAreaCodes.indexOf(code)
			if (idx > -1) {
				this.selectedAreaCodes.splice(idx, 1)
			} else {
				this.selectedAreaCodes.push(code)
			}
			this.form.areas = this.selectedAreaCodes.join(',')
		},
		removeArea(index) {
			this.selectedAreaCodes = removeAreaCodeAtIndex(this.selectedAreaCodes, index)
			this.form.areas = this.selectedAreaCodes.join(',')
		},
		toggleSubject(val) {
			const idx = this.form.subjects.indexOf(val)
			if (idx > -1) {
				this.form.subjects.splice(idx, 1)
			} else {
				this.form.subjects.push(val)
			}
		},
		removeSubject(index) {
			this.form.subjects.splice(index, 1)
		},
		openAgreement() {
			uni.navigateTo({ url: tutorAgreementRoute })
		},
		validate() {
			if (!this.form.realName.trim()) {
				uni.showToast({ title: '请填写真实姓名', icon: 'none' })
				return false
			}
			if (!/^\d{17}[\dXx]$/.test(this.form.idCard)) {
				uni.showToast({ title: '请填写正确的18位身份证号', icon: 'none' })
				return false
			}
			if (this.form.identity === '' || this.form.identity === null || this.form.identity === undefined) {
				uni.showToast({ title: '请选择身份', icon: 'none' })
				return false
			}
			if (!this.form.city.trim()) {
				uni.showToast({ title: '请填写城市', icon: 'none' })
				return false
			}
			if (this.form.city.trim().length > 15) {
				uni.showToast({ title: '城市不能超过15个字', icon: 'none' })
				return false
			}
			if (!this.form.school.trim()) {
				uni.showToast({ title: '请填写就读/毕业学校', icon: 'none' })
				return false
			}
			if (!this.form.major.trim()) {
				uni.showToast({ title: '请填写专业名称', icon: 'none' })
				return false
			}
			if (!this.form.degree) {
				uni.showToast({ title: '请选择最高学历', icon: 'none' })
				return false
			}
			if (this.form.subjects.length === 0) {
				uni.showToast({ title: '请至少选择一个可教科目', icon: 'none' })
				return false
			}
			if (!this.form.areas.trim()) {
				uni.showToast({ title: '请填写可授课区域', icon: 'none' })
				return false
			}
			if (!this.form.methods) {
				uni.showToast({ title: '请选择辅导方式', icon: 'none' })
				return false
			}
			if (!this.form.experience.trim()) {
				uni.showToast({ title: '请填写教学经历', icon: 'none' })
				return false
			}
			if (!this.agreed) {
				uni.showToast({ title: '请阅读并同意入驻服务协议', icon: 'none' })
				return false
			}
			return true
		},
		async handleSubmit() {
			if (!this.validate() || this.submitting) return
			this.submitting = true
			try {
				const res = await addTutors({
					realName: this.form.realName,
					idCard: this.form.idCard,
					identity: this.form.identity,
					city: this.form.city.trim(),
					school: this.form.school,
					major: this.form.major,
					degree: this.form.degree,
					subjects: this.form.subjects.join(','),
					areas: this.form.areas,
					methods: this.form.methods,
					experience: this.form.experience,
					certificateList: this.form.certificateList,
					selfJudge: this.form.selfJudge,
					certificates: this.form.certificates
				})
				uni.showToast({ title: '申请已提交，等待审核', icon: 'success' })
				setTimeout(() => {
					uni.navigateTo({ url: '/pages/tutoring/tutor/detail?id=' + res.data })
				}, 1000)
			} catch (e) {
				uni.showToast({ title: '提交失败，请重试', icon: 'none' })
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss">
page {
	background: #f4f6fb;
}

.page {
	min-height: 100vh;
	background: #f4f6fb;
}

.page-body {
	padding: 16px;
	padding-bottom: 40px;
}

.section-card {
	background: #fff;
	border-radius: 16px;
	padding: 20px 16px;
	margin-bottom: 14px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16px;
}

.section-icon-wrap {
	width: 30px;
	height: 30px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
	flex-shrink: 0;
}

.section-icon-wrap.blue { background: #EFF6FF; }
.section-icon-wrap.green { background: #ECFDF5; }
.section-icon-wrap.orange { background: #FFFBEB; }

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	flex: 1;
}

.form-item {
	margin-bottom: 16px;
}

.form-label {
	display: block;
	font-size: 14px;
	font-weight: 500;
	color: #334155;
	margin-bottom: 8px;
}

.form-input,
.form-textarea,
.picker-full-box {
	width: 100%;
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	border-radius: 12px;
	padding: 12px 14px;
	font-size: 14px;
	color: #0F172A;
	box-sizing: border-box;
}

.picker-full-box {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.picker-text.placeholder {
	color: #94A3B8;
}

.form-textarea {
	min-height: 88px;
}

.word-count {
	display: block;
	text-align: right;
	font-size: 12px;
	color: #94A3B8;
	margin-top: 6px;
}

.label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.add-btn {
	display: flex;
	align-items: center;
	gap: 4px;
}

.add-btn-text {
	font-size: 12px;
	color: #3B82F6;
}

.subject-tags-wrap,
.method-tags,
.tag-row {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.subject-tag,
.method-tag {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 8px 12px;
	border-radius: 14px;
	background: #EFF6FF;
	border: 1px solid #BFDBFE;
}

.method-tag.active {
	background: #2563EB;
	border-color: #2563EB;
}

.subject-option-active {
	background: #F8FAFC;
	border-color: #94A3B8;
}

.subject-tag-text,
.method-tag-text {
	font-size: 13px;
	color: #1E40AF;
}

.method-tag.active .method-tag-text {
	color: #fff;
}

.subject-option-active .subject-option-text {
	color: #2563EB;
	font-weight: 600;
}

.subject-empty-text {
	font-size: 13px;
	color: #94A3B8;
}

.agree-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 20px 0 14px;
}

.check-box {
	width: 18px;
	height: 18px;
	border-radius: 4px;
	border: 1px solid #CBD5E1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-box.checked {
	background: #2563EB;
	border-color: #2563EB;
}

.agree-text,
.agree-link {
	font-size: 13px;
}

.agree-link {
	color: #2563EB;
}

.submit-wrap {
	margin-top: 8px;
}

.submit-btn {
	background: linear-gradient(135deg, #2563EB, #3B82F6);
	border-radius: 999px;
	padding: 14px 0;
	text-align: center;
}

.submit-btn.disabled {
	opacity: 0.6;
}

.submit-text {
	color: #fff;
	font-size: 16px;
	font-weight: 600;
}

.submit-hint {
	display: block;
	text-align: center;
	font-size: 12px;
	color: #94A3B8;
	margin-top: 10px;
}

.picker-overlay {
	position: fixed;
	inset: 0;
	z-index: 999;
}

.picker-mask {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.35);
	opacity: 0;
	transition: opacity 0.3s;
}

.picker-mask--active {
	opacity: 1;
}

.picker-sheet {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	transform: translateY(100%);
	transition: transform 0.3s;
}

.picker-sheet--active {
	transform: translateY(0);
}

.subject-popup {
	background: #fff;
	border-radius: 20px 20px 0 0;
	padding: 18px 16px 24px;
}

.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.popup-title {
	font-size: 16px;
	font-weight: 600;
	color: #0F172A;
}

.subject-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.subject-option {
	padding: 10px 8px;
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	border-radius: 14px;
	text-align: center;
}

.subject-option-text {
	font-size: 13px;
	color: #334155;
}

.popup-confirm-btn {
	margin-top: 16px;
	background: #2563EB;
	border-radius: 999px;
	padding: 12px 0;
	text-align: center;
}

.popup-confirm-text {
	color: #fff;
	font-size: 14px;
	font-weight: 600;
}
</style>
