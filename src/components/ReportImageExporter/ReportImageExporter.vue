<template>
  <view class="report-image-exporter" :style="hostStyle">
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="report-image-exporter__canvas"
      :style="canvasStyle"
    ></canvas>
  </view>
</template>

<script>
const DEFAULT_FILE_TYPE = 'png'
const DEFAULT_QUALITY = 1
const SYSTEM_INFO = uni.getSystemInfoSync()
const WINDOW_WIDTH = SYSTEM_INFO.windowWidth || 375
const PIXEL_RATIO = SYSTEM_INFO.pixelRatio || 1
const DESIGN_WIDTH = 750

export default {
  name: 'ReportImageExporter',
  props: {
    canvasId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      canvasWidth: 1,
      canvasHeight: 1
    }
  },
  computed: {
    canvasStyle() {
      return `width:${this.canvasWidth}px;height:${this.canvasHeight}px;`
    },
    hostStyle() {
      return this.canvasStyle
    }
  },
  methods: {
    async exportImage(options) {
      this.assertExportOptions(options)
      const canvasSize = this.getCanvasSize(options)
      this.canvasWidth = canvasSize.cssWidth
      this.canvasHeight = canvasSize.cssHeight
      await this.waitForRender()

      const ctx = uni.createCanvasContext(this.canvasId, this)
      ctx.scale(canvasSize.cssScale, canvasSize.cssScale)
      options.draw(ctx)
      await this.flushCanvas(ctx)
      return this.canvasToTempFilePath(options, canvasSize)
    },
    assertExportOptions(options) {
      if (!options || typeof options.draw !== 'function') {
        throw new Error('导出失败：缺少绘制函数')
      }
      if (!Number.isFinite(options.width) || !Number.isFinite(options.height)) {
        throw new Error('导出失败：画布尺寸无效')
      }
      if (options.width <= 0 || options.height <= 0) {
        throw new Error('导出失败：画布尺寸必须大于 0')
      }
    },
    getCanvasSize(options) {
      const cssWidth = Math.round(options.width * WINDOW_WIDTH / DESIGN_WIDTH)
      const cssScale = cssWidth / options.width
      const cssHeight = Math.ceil(options.height * cssScale)
      const exportScale = options.scale || PIXEL_RATIO
      return {
        cssScale,
        cssWidth,
        cssHeight,
        destWidth: Math.round(cssWidth * exportScale),
        destHeight: Math.round(cssHeight * exportScale)
      }
    },
    waitForRender() {
      return new Promise(resolve => this.$nextTick(resolve))
    },
    flushCanvas(ctx) {
      return new Promise(resolve => {
        ctx.draw(false, () => {
          setTimeout(resolve, 200)
        })
      })
    },
    canvasToTempFilePath(options, canvasSize) {
      return new Promise((resolve, reject) => {
        uni.canvasToTempFilePath({
          canvasId: this.canvasId,
          x: 0,
          y: 0,
          width: canvasSize.cssWidth,
          height: canvasSize.cssHeight,
          destWidth: canvasSize.destWidth,
          destHeight: canvasSize.destHeight,
          quality: DEFAULT_QUALITY,
          fileType: DEFAULT_FILE_TYPE,
          success: res => resolve(res.tempFilePath),
          fail: reject
        }, this)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.report-image-exporter {
  position: fixed;
  left: -9999px;
  top: 0;
  overflow: hidden;
  pointer-events: none;
}

.report-image-exporter__canvas {
  display: block;
}
</style>
