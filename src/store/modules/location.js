import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 地区 Store
 * 保存当前选中城市及其下属区县列表
 * 区县列表用于 list.vue 的区域筛选 uni-data-picker
 */
export const useLocationStore = defineStore('location', () => {
    // 当前城市 { code, name }
    const city = ref({ code: '', name: '' })
    const department = ref({ deptId: undefined, deptName: '' })
    // 当前城市下的区县列表，格式适配 uni-data-picker localdata: [{ value, text }]
    const districts = ref([])

    /**
     * 传入 pca-code.json 中的「城市」节点，提取区县并保存
     * cityNode 结构示例：
     *   { code: '3201', name: '南京市', children: [{ code:'320102', name:'玄武区' }, ...] }
     */
    function setCity(cityNode) {
        if (!cityNode) return

        // pca-code.json 的字段是 text / value，兼容 name / code
        const name = cityNode.name || cityNode.text || ''
        const code = cityNode.code || cityNode.value || ''
        city.value = { code, name }

        // 提取区县列表
        // 某些直辖市结构是 省→市辖区→区县，需要展开一层
        let districtNodes = []
        if (cityNode.children && cityNode.children.length > 0) {
            const firstChild = cityNode.children[0]
            if (firstChild.children && firstChild.children.length > 0) {
                // 直辖市：再展开一层
                cityNode.children.forEach(sub => {
                    if (sub.children) {
                        districtNodes = districtNodes.concat(sub.children)
                    }
                })
            } else {
                districtNodes = cityNode.children
            }
        }

        districts.value = districtNodes.map(d => ({
            value: d.code || d.value,
            text: d.name || d.text
        }))
    }


    function setDepartment(dept = {}) {
        department.value = {
            deptId: dept.deptId || dept.value,
            deptName: dept.deptName || dept.text || ''
        }
    }

    /**
     * 获取当前选中城市
     * @returns {{ code: string, name: string }}
     */
    function getCity() {
        return city.value
    }

    return {
        city,
        department,
        districts,
        setCity,
        setDepartment,
        getCity
    }
})
