export const CATEGORY_OPTIONS = Object.freeze([
	{ value: '', label: '全部' },
	{ value: '0', label: '家教' },
	{ value: '1', label: '助教' },
	{ value: '2', label: '派发' },
	{ value: '3', label: '其他' }
])

export const CAT_STYLES = Object.freeze({
	'0': { bg: '#EAF3FF', color: '#3B82F6' },
	'1': { bg: '#EEF9F0', color: '#10B981' },
	'2': { bg: '#FFF8E6', color: '#F59E0B' },
	'3': { bg: '#F3F4F6', color: '#888' }
})

export const STATUS_OPTIONS = Object.freeze([
	{ value: '', label: '全部状态' },
	{ value: '0', label: '招募中' },
	{ value: '1', label: '已满员' },
	{ value: '2', label: '已结束' }
])

export function getCatLabel(value) {
	const found = CATEGORY_OPTIONS.find(item => item.value === String(value))
	return found && found.value !== '' ? found.label : '其他'
}

export function getCatStyle(value) {
	const style = CAT_STYLES[String(value)] || CAT_STYLES['3']
	return `background:${style.bg}; color:${style.color};`
}

export function getStatusLabel(value) {
	const found = STATUS_OPTIONS.find(item => item.value === String(value))
	return found && found.value !== '' ? found.label : '--'
}

export function getStatusClass(value) {
	const map = { '0': 'status-open', '1': 'status-full', '2': 'status-end' }
	return map[String(value)] || ''
}

export function formatId(id) {
	return id ? String(id).slice(-8).toUpperCase() : '----'
}
