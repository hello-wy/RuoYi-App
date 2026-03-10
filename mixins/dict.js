import { getDicts } from '@/api/system/dict/data'
import useDictStore from '@/store/modules/dict'

/**
 * dict mixin
 *
 * 在组件选项中声明:
 *   dicts: ['sys_methods', 'sys_subject', ...]
 *
 * mixin 会在 created 时自动拉取字典并挂载到:
 *   this.dict.type.sys_methods  =>  [{ label, value, elTagType, elTagClass }, ...]
 */
export const dictMixin = {
    data() {
        return {
            dict: {
                type: {}
            }
        }
    },
    created() {
        const dictTypes = this.$options.dicts
        if (!dictTypes || !dictTypes.length) return

        const dictStore = useDictStore()

        dictTypes.forEach((dictType) => {
            // 先初始化为空数组，避免模板访问时报错
            this.$set ? this.$set(this.dict.type, dictType, []) : (this.dict.type[dictType] = [])

            // 优先从 Pinia 缓存中读取
            const cached = dictStore.getDict(dictType)
            if (cached && cached.length) {
                this.$set ? this.$set(this.dict.type, dictType, cached) : (this.dict.type[dictType] = cached)
                return
            }

            // 缓存未命中，从服务端拉取
            getDicts(dictType)
                .then((res) => {
                    const list = (res.data || []).map((item) => ({
                        label: item.dictLabel,
                        value: item.dictValue,
                        elTagType: item.listClass || '',
                        elTagClass: item.cssClass || ''
                    }))
                    dictStore.setDict(dictType, list)
                    this.$set ? this.$set(this.dict.type, dictType, list) : (this.dict.type[dictType] = list)
                })
                .catch((err) => {
                    console.error(`[dictMixin] 拉取字典 "${dictType}" 失败`, err)
                })
        })
    }
}

export default dictMixin
