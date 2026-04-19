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

				<!-- 生活 -->
				<view class="form-item">
					<text class="form-label">生活</text>
					<picker
						mode="selector"
						:range="districtOptions"
						range-key="text"
						:value="liveIndex"
						@change="onLiveChange"
					>
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.live }">
								{{ getLiveLabel(form.live) || '请选择生活地点' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>

				<!-- 工作 -->
				<view class="form-item">
					<text class="form-label">工作</text>
					<picker
						mode="selector"
						:range="districtOptions"
						range-key="text"
						:value="workIndex"
						@change="onWorkChange"
					>
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.work }">
								{{ getWorkLabel(form.work) || '请选择工作地点' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>

			</view>

			<!-- ===== 学历信息 ===== -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap green">
						<uni-icons type="staff-filled" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">学历信息</text>
				</view>

				<!-- 就读/毕业学校 -->
				<view class="form-item">
					<text class="form-label">就读/毕业学校</text>
					<input
						class="form-input"
						v-model="form.school"
						placeholder="例：北京大学"
						maxlength="50"
					/>
				</view>

				<!-- 专业名称 -->
				<view class="form-item">
					<text class="form-label">专业名称</text>
					<input
						class="form-input"
						v-model="form.major"
						placeholder="例：数学与应用数学"
						maxlength="50"
					/>
				</view>

				<!-- 学历选择 -->
				<view class="form-item">
					<text class="form-label">最高学历</text>
					<picker
						mode="selector"
						:range="dict.type.sys_degree"
						range-key="label"
						:value="degreeIndex"
						@change="onDegreeChange"
					>
						<view class="picker-full-box">
							<text class="picker-text" :class="{ placeholder: !form.degree }">
								{{ getDegreeLabel(form.degree) || '请选择学历' }}
							</text>
							<uni-icons type="bottom" size="12" color="#aaa"></uni-icons>
						</view>
					</picker>
				</view>
			</view>

			<!-- ===== 教学概况 ===== -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap orange">
						<uni-icons type="compose" size="16" color="#F59E0B"></uni-icons>
					</view>
					<text class="section-title">教学概况</text>
				</view>

				<!-- 可教科目 多选 -->
				<view class="form-item">
					<view class="label-row">
						<text class="form-label">可教科目</text>
						<view class="add-btn" @click="openSubjectPopup">
							<uni-icons type="plusempty" size="14" color="#3B82F6"></uni-icons>
							<text class="add-btn-text">添加科目</text>
						</view>
					</view>
					<view class="subject-tags-wrap">
						<view
							v-for="(sub, index) in form.subjects"
							:key="index"
							class="subject-tag"
						>
							<text class="subject-tag-text">{{ getSubjectLabel(sub) }}</text>
							<uni-icons
								type="closeempty"
								size="11"
								color="#3B82F6"
								@click="removeSubject(index)"
							></uni-icons>
						</view>
						<view v-if="form.subjects.length === 0" class="subject-empty">
							<text class="subject-empty-text">暂未添加科目，点击右侧添加</text>
						</view>
					</view>
				</view>

				<!-- 可授课区域 -->
				<view class="form-item">
					<view class="label-row">
						<text class="form-label">可授课区域</text>
						<view class="add-btn" @click="openAreaPopup">
							<uni-icons type="plusempty" size="14" color="#3B82F6"></uni-icons>
							<text class="add-btn-text">添加区域</text>
						</view>
					</view>
					<view class="subject-tags-wrap">
						<view
							v-for="(code, index) in selectedAreaCodes"
							:key="index"
							class="subject-tag"
						>
							<text class="subject-tag-text">{{ getAreaText(code) }}</text>
							<uni-icons
								type="closeempty"
								size="11"
								color="#3B82F6"
								@click="removeArea(index)"
							></uni-icons>
						</view>
						<view v-if="selectedAreaCodes.length === 0" class="subject-empty">
							<text class="subject-empty-text">暂未添加区域，点击右侧添加</text>
						</view>
					</view>
				</view>

				<!-- 授课方式 -->
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

				<!-- 教学经历 -->
				<view class="form-item">
					<text class="form-label">教学经历</text>
					<textarea
						class="form-textarea"
						v-model="form.experience"
						placeholder="介绍您的教学经验、风格和特长优势..."
						maxlength="500"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.experience || '').length }}/500</text>
				</view>
			</view>

			<!-- ===== 证书与自我评价 ===== -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap green">
						<uni-icons type="medal-filled" size="16" color="#10B981"></uni-icons>
					</view>
					<text class="section-title">证书与自我评价</text>
				</view>

				<!-- 证书 -->
				<view class="form-item">
					<text class="form-label">证书</text>
					<textarea
						class="form-textarea"
						v-model="form.certificate"
						placeholder="例：教师资格证（语文）、普通话二甲等"
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.certificate || '').length }}/300</text>
				</view>

				<!-- 自我评价 -->
				<view class="form-item">
					<text class="form-label">自我评价</text>
					<textarea
						class="form-textarea"
						v-model="form.selfJudge"
						placeholder="简单介绍一下您的个人特点和优势..."
						maxlength="300"
						:show-confirm-bar="false"
					></textarea>
					<text class="word-count">{{ (form.selfJudge || '').length }}/300</text>
				</view>
			</view>

			<!-- ===== 资质认证 ===== -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon-wrap purple">
						<uni-icons type="medal-filled" size="16" color="#8B5CF6"></uni-icons>
					</view>
					<text class="section-title">资质认证</text>
					<text class="section-badge">提交后人工审核学历</text>
				</view>
				<text class="section-desc">请上传教师资格证或学生证，支持 JPG、PNG 格式，最大 5MB</text>

				<view class="upload-area" @click="chooseImage">
					<view v-if="!form.certificates" class="upload-placeholder">
						<uni-icons type="cloud-upload-filled" size="36" color="#3B82F6"></uni-icons>
						<text class="upload-text">点击上传图片</text>
						<text class="upload-hint">支持 JPG、PNG 格式，最大 5MB</text>
					</view>
					<view v-else class="upload-preview">
						<image
							:src="form.certificates"
							class="cert-img"
							mode="aspectFit"
						></image>
						<view class="img-clear" @click.stop="form.certificates = ''">
							<uni-icons type="clear" size="20" color="#fff"></uni-icons>
						</view>
					</view>
				</view>
				<view v-if="uploading" class="uploading-tip">
					<uni-icons type="spinner-cycle" size="14" color="#3B82F6"></uni-icons>
					<text class="uploading-text">图片上传中...</text>
				</view>
			</view>

			<!-- 协议 -->
			<view class="agree-row">
				<view class="agree-check" @click="agreed = !agreed">
					<view class="check-box" :class="{ checked: agreed }">
						<uni-icons v-if="agreed" type="checkmarkempty" size="12" color="#fff"></uni-icons>
					</view>
				</view>
				<text class="agree-text">我已阅读并同意</text>
				<text class="agree-link" @click="openAgreement">《家教入驻服务协议》</text>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-wrap">
				<view class="submit-btn" :class="{ disabled: submitting }" @click="handleSubmit">
					<text class="submit-text">{{ submitting ? '提交中...' : '提交申请' }}</text>
				</view>
				<text class="submit-hint">提交后平台将在 1-3 个工作日内完成审核</text>
			</view>

		</view>

		<!-- 区域选择弹窗 —— 自定义 overlay，不依赖 uni-popup -->
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
						<view
							v-for="item in districtOptions"
							:key="item.value"
							class="subject-option"
							:class="{ 'subject-option-active': selectedAreaCodes.includes(item.value) }"
							@click="toggleArea(item.value)"
						>
							<text class="subject-option-text">{{ item.text }}</text>
						</view>
					</view>
					<view class="popup-confirm-btn" @click="closeAreaPopup">
						<text class="popup-confirm-text">确定（已选 {{ selectedAreaCodes.length }} 项）</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 科目选择弹窗 —— 自定义 overlay，不依赖 uni-popup -->
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
						<view
							v-for="item in dict.type.sys_subject"
							:key="item.value"
							class="subject-option"
							:class="{ 'subject-option-active': form.subjects.includes(item.value) }"
							@click="toggleSubject(item.value)"
						>
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
import upload from '@/utils/upload'
import { useLocationStore, useUserStore } from '@/store'
import config from '@/config'
import RealVerify from '@/components/RealVerify/RealVerify.vue'


export default {
	components: { RealVerify },
	dicts: ['sys_subject', 'sys_degree', 'sys_methods'],
	data() {
		return {
			verified: false,
			submitting: false,
			uploading: false,
			agreed: false,
			form: {
				realName: '',
				idCard: '',
				live: '',
				work: '',
				school: '',
				major: '',
				degree: '',
				subjects: [],
				areas: '',
				methods: '',
				experience: '',
				certificate: '',
				selfJudge: '',
				certificates: ''
			},
			degreeIndex: -1,
			methodsIndex: -1,
			liveIndex: -1,
			workIndex: -1,
			selectedAreaCodes: [],
			// 自定义弹窗状态
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
			this.$nextTick(() => {
				setTimeout(() => { this.areaPopupShown = true }, 30)
			})
		},
		closeAreaPopup() {
			this.areaPopupShown = false
			setTimeout(() => { this.areaPopupVisible = false }, 300)
		},
		openSubjectPopup() {
			this.subjectPopupVisible = true
			this.$nextTick(() => {
				setTimeout(() => { this.subjectPopupShown = true }, 30)
			})
		},
		closeSubjectPopup() {
			this.subjectPopupShown = false
			setTimeout(() => { this.subjectPopupVisible = false }, 300)
		},
		getSubjectLabel(val) {
			const item = (this.dict.type.sys_subject || []).find(o => o.value === val)
			return item ? item.label : val
		},
		getDegreeLabel(val) {
			const item = (this.dict.type.sys_degree || []).find(o => o.value === val)
			return item ? item.label : val
		},
		getMethodsLabel(val) {
			const item = (this.dict.type.sys_methods || []).find(o => o.value === val)
			return item ? item.label : val
		},
		onDegreeChange(e) {
			this.degreeIndex = e.detail.value
			const opt = (this.dict.type.sys_degree || [])[e.detail.value]
			this.form.degree = opt ? opt.value : ''
		},
		getLiveLabel(val) {			
			const item = this.districtOptions.find(o => o.value === val)
			return item ? item.text : ''
		},
		getWorkLabel(val) {
			const item = this.districtOptions.find(o => o.value === val)
			return item ? item.text : ''
		},
		onLiveChange(e) {
			this.liveIndex = e.detail.value
			const opt = this.districtOptions[e.detail.value]
			this.form.live = opt.value
		},
		onWorkChange(e) {
			this.workIndex = e.detail.value
			const opt = this.districtOptions[e.detail.value]
			this.form.work = opt.value
		},
		onMethodsChange(e) {
			this.methodsIndex = e.detail.value
			const opt = (this.dict.type.sys_methods || [])[e.detail.value]
			this.form.methods = opt ? opt.value : ''
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
			
			if (idx > -1) { // 已选中，取消选择
				this.selectedAreaCodes.splice(idx, 1)
			} else {
				this.selectedAreaCodes.push(code)
			}
			this.form.areas = this.selectedAreaCodes.join(',')
		},
		removeArea(index) {
			this.selectedAreaCodes.splice(index, 1)
			this.form.areas = this.selectedAreaCodes
				.map(c => this.getAreaText(c))
				.join(',')
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
		/* 图片上传 */
		chooseImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const filePath = res.tempFilePaths[0]
					this.uploading = true
					try {
						const result = await upload({
							url: '/common/upload',
							filePath,
							name: 'file'
						})
						this.form.certificates = config.baseUrl + result.fileName
					} catch (e) {
						uni.showToast({ title: '图片上传失败，请重试', icon: 'none' })
					} finally {
						this.uploading = false
					}
				}
			})
		},
		openAgreement() {
			uni.navigateTo({ url: '/pages/common/textview/index?type=tutor_agreement' })
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
			if (!this.form.certificates) {
				uni.showToast({ title: '请上传教师资格证或学生证', icon: 'none' })
				return false
			}
			if (!this.agreed) {
				uni.showToast({ title: '请阅读并同意入驻服务协议', icon: 'none' })
				return false
			}
			return true
		},
		async handleSubmit() {		
			if (!this.validate()) return
			if (this.submitting) return
			this.submitting = true
			try {
				const res = await addTutors({
					realName: this.form.realName,
					idCard: this.form.idCard,
					live: this.form.live,
					work: this.form.work,
					school: this.form.school,
					major: this.form.major,
					degree: this.form.degree,
					subjects: this.form.subjects.join(','),
					areas: this.form.areas,
					methods: this.form.methods,
					experience: this.form.experience,
					certificate: this.form.certificate,		//证书证明
					selfJudge: this.form.selfJudge,
					certificates: this.form.certificates,	//区别在于s是图片的存储
					isCertified: this.verified ? '1' : '0'
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

/* Section 卡片 */
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
.section-icon-wrap.purple { background: #F5F3FF; }

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	flex: 1;
}

.section-badge {
	font-size: 11px;
	color: #8B5CF6;
	background: #F5F3FF;
	border-radius: 20px;
	padding: 2px 8px;
}

.section-desc {
	font-size: 12px;
	color: #94a3b8;
	line-height: 1.6;
	margin-bottom: 14px;
	display: block;
}

/* 表单 */
.form-item {
	margin-bottom: 16px;
}

.form-label {
	display: block;
	font-size: 13px;
	color: #64748b;
	margin-bottom: 6px;
}

.form-hint {
	display: block;
	font-size: 11px;
	color: #94a3b8;
	margin-top: 4px;
}

.form-input {
	width: 100%;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
}

.picker-full-box {
	width: 100%;
	height: 44px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 0 14px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}

.picker-text {
	font-size: 14px;
	color: #1e293b;
}

.picker-text.placeholder {
	color: #a0aec0;
}

/* 科目标签 */
.label-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.add-btn {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 2px;
}

.add-btn-text {
	font-size: 13px;
	color: #3B82F6;
}

.subject-tags-wrap {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px;
	min-height: 36px;
	align-items: center;
}

.subject-tag {
	display: flex;
	flex-direction: row;
	align-items: center;
	background: #EFF6FF;
	border-radius: 20px;
	padding: 5px 10px;
	gap: 4px;
}

.subject-tag-text {
	font-size: 13px;
	color: #3B82F6;
}

.subject-empty {
	padding: 8px 0;
}

.subject-empty-text {
	font-size: 13px;
	color: #a0aec0;
}

/* 文本域 */
.form-textarea {
	width: 100%;
	min-height: 90px;
	background: #f8fafc;
	border: 1.5px solid #e2e8f0;
	border-radius: 10px;
	padding: 12px 14px;
	font-size: 14px;
	color: #1e293b;
	box-sizing: border-box;
	line-height: 1.6;
}

.word-count {
	display: block;
	text-align: right;
	font-size: 11px;
	color: #94a3b8;
	margin-top: 4px;
}

/* 图片上传 */
.upload-area {
	border: 2px dashed #BFDBFE;
	border-radius: 12px;
	background: #f8fafc;
	min-height: 150px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	position: relative;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 24px;
}

.upload-text {
	font-size: 14px;
	color: #3B82F6;
	font-weight: 600;
}

.upload-hint {
	font-size: 11px;
	color: #94a3b8;
}

.upload-preview {
	width: 100%;
	height: 200px;
	position: relative;
}

.cert-img {
	width: 100%;
	height: 100%;
}

.img-clear {
	position: absolute;
	top: 8px;
	right: 8px;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.uploading-tip {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 6px;
	margin-top: 8px;
}

.uploading-text {
	font-size: 12px;
	color: #3B82F6;
}

/* 协议 */
.agree-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 16px;
	padding: 0 4px;
}

.agree-check {
	margin-right: 8px;
}

.check-box {
	width: 18px;
	height: 18px;
	border-radius: 5px;
	border: 1.5px solid #cbd5e1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-box.checked {
	background: #3B82F6;
	border-color: #3B82F6;
}

.agree-text {
	font-size: 13px;
	color: #64748b;
}

.agree-link {
	font-size: 13px;
	color: #3B82F6;
}

/* 授课方式多选标签 */
.method-tags {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 8px;
}

.method-tag {
	padding: 7px 14px;
	border-radius: 20px;
	border: 1.5px solid #e2e8f0;
	background: #f8fafc;
}

.method-tag.active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.method-tag-text {
	font-size: 13px;
	color: #64748b;
}

.method-tag.active .method-tag-text {
	color: #3B82F6;
	font-weight: 600;
}

/* 提交 */
.submit-wrap {
	margin-top: 4px;
}

.submit-btn {
	background: #1e293b;
	border-radius: 14px;
	height: 52px;
	display: flex;
	align-items: center;
	justify-content: center;
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
	color: #94a3b8;
	margin-top: 10px;
}

/* 科目弹窗 */
.subject-popup {
	background: #fff;
	border-radius: 20px 20px 0 0;
	padding: 20px 16px;
}

.popup-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.popup-title {
	font-size: 17px;
	font-weight: 700;
	color: #1e293b;
}

.popup-close {}

.subject-grid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 16px;
}

.subject-option {
	padding: 8px 16px;
	border-radius: 20px;
	border: 1.5px solid #e2e8f0;
	background: #f8fafc;
}

.subject-option-active {
	border-color: #3B82F6;
	background: #EFF6FF;
}

.subject-option-text {
	font-size: 14px;
	color: #64748b;
}

.subject-option-active .subject-option-text {
	color: #3B82F6;
	font-weight: 600;
}

.popup-confirm-btn {
	background: #3B82F6;
	border-radius: 12px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
}

.popup-confirm-text {
	color: #fff;
	font-size: 15px;
	font-weight: 600;
}

/* ===== 自定义底部弹出 overlay ===== */
.picker-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9000;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.picker-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0);
	transition: background 0.3s ease;
}

.picker-mask--active {
	background: rgba(0, 0, 0, 0.5);
}

.picker-sheet {
	position: relative;
	z-index: 1;
	max-height: 80vh;
	overflow-y: auto;
	transform: translateY(100%);
	transition: transform 0.3s ease;
}

.picker-sheet--active {
	transform: translateY(0);
}

</style>
