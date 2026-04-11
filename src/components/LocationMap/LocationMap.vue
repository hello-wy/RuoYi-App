<template>
  <view class="location-card">
    <!-- 地图容器 -->
    <view class="location-map" @click="handleMapClick">
      <map
        v-if="latitude && longitude"
        :latitude="latitude"
        :longitude="longitude"
        :markers="markers"
        :scale="11"
        class="map-view"
        :show-location="false"
      >
      </map>
      <view v-else class="map-placeholder">
        <view class="map-icon">
          <uni-icons type="location-filled" color="#FF5A5F" size="30"></uni-icons>
        </view>
        <text class="location-address">{{ address }}</text>
      </view>
    </view>

    <!-- 距离信息 -->
    <view class="location-distance" v-if="showDistance">
      <text class="distance-label">工作地离</text>
      <text class="distance-value">{{ distanceText }}</text>
      <text class="navigate-icon">→</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LocationMap',
  props: {
    // 地址文本
    address: {
      type: String,
      default: ''
    },
    // 纬度
    latitude: {
      type: Number,
      default: 0
    },
    // 经度
    longitude: {
      type: Number,
      default: 0
    },
    // 是否显示距离
    showDistance: {
      type: Boolean,
      default: true
    },
    // 距离文本
    distanceText: {
      type: String,
      default: '距离你 3.2km'
    },
    // 地点名称（用于导航）
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    markers() {
      if (!this.latitude || !this.longitude) {
        return []
      }
      return [{
        id: 1,
        latitude: this.latitude,
        longitude: this.longitude,
      }]
    }
  },
  methods: {
    handleMapClick() {
      // 如果没有经纬度，不显示导航选项
      if (!this.latitude || !this.longitude) {
        uni.showToast({
          title: '暂无位置信息',
          icon: 'none'
        })
        return
      }

      // #ifdef MP-WEIXIN
      // 微信小程序优先使用 wx.openLocation
      this.openWechatLocation()
      // #endif

      // #ifndef MP-WEIXIN
      this.showNavigationOptions()
      // #endif
    },

    // 微信小程序打开位置
    openWechatLocation() {
      uni.showActionSheet({
        itemList: ['使用腾讯地图导航', '使用内置地图查看'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 打开腾讯地图导航
            this.openTencentMap()
          } else if (res.tapIndex === 1) {
            // 使用微信内置地图查看位置
            wx.openLocation({
              latitude: this.latitude,
              longitude: this.longitude,
              name: this.name || this.address,
              address: this.address,
              scale: 15,
              fail: (err) => {
                console.error('打开地图失败', err)
                uni.showToast({
                  title: '打开地图失败',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    },

    // 其他平台显示导航选项
    showNavigationOptions() {
      const itemList = []
      
      // #ifdef APP-PLUS
      itemList.push('高德地图', '百度地图', '腾讯地图')
      // #endif
      
      // #ifdef H5
      itemList.push('高德地图', '百度地图', '腾讯地图')
      // #endif

      if (itemList.length === 0) {
        uni.showToast({
          title: '当前平台暂不支持',
          icon: 'none'
        })
        return
      }

      uni.showActionSheet({
        itemList: itemList,
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.openGaodeMap()
              break
            case 1:
              this.openBaiduMap()
              break
            case 2:
              this.openTencentMap()
              break
          }
        }
      })
    },

    // 打开高德地图
    openGaodeMap() {
      const url = `https://uri.amap.com/marker?position=${this.longitude},${this.latitude}&name=${encodeURIComponent(this.name || this.address)}&src=myapp&coordinate=wgs84&callnative=1`
      
      // #ifdef APP-PLUS
      plus.runtime.openURL(url, (err) => {
        if (err) {
          uni.showToast({
            title: '请先安装高德地图',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
      
      // #ifdef MP-WEIXIN
      uni.showToast({
        title: '小程序不支持跳转',
        icon: 'none'
      })
      // #endif
    },

    // 打开百度地图
    openBaiduMap() {
      // 需要将WGS84坐标转换为百度坐标（如果需要的话）
      const url = `https://api.map.baidu.com/marker?location=${this.latitude},${this.longitude}&title=${encodeURIComponent(this.name || this.address)}&content=${encodeURIComponent(this.address)}&output=html&src=myapp`
      
      // #ifdef APP-PLUS
      plus.runtime.openURL(url, (err) => {
        if (err) {
          uni.showToast({
            title: '请先安装百度地图',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
    },

    // 打开腾讯地图
    openTencentMap() {
      const url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${this.latitude},${this.longitude};title:${encodeURIComponent(this.name || this.address)};addr:${encodeURIComponent(this.address)}&referer=myapp`
      
      // #ifdef APP-PLUS
      plus.runtime.openURL(url, (err) => {
        if (err) {
          uni.showToast({
            title: '请先安装腾讯地图',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.location-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
}

.location-map {
  background: #F5F5F5;
  border-radius: 16rpx;
  height: 240rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.map-icon {
  margin-bottom: 16rpx;
}

.location-address {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.location-distance {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #FAFAFA;
  border-radius: 12rpx;
}

.distance-label {
  font-size: 26rpx;
  color: #999999;
}

.distance-value {
  flex: 1;
  font-size: 26rpx;
  color: #1A1A1A;
  margin-left: 16rpx;
}

.navigate-icon {
  font-size: 32rpx;
  color: #999999;
}
</style>
