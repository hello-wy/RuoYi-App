const fs = require('node:fs')
const path = require('node:path')
const ci = require('miniprogram-ci')

const appid = process.env.WECHAT_APPID || 'wx0ac1366c34e4ce68'
const outputPath = process.env.WECHAT_PROJECT_PATH || path.join(process.cwd(), 'dist/build/mp-weixin')
const keyPath = process.env.WECHAT_PRIVATE_KEY_PATH || path.join(process.cwd(), `conf/private.${appid}.key`)

/**
 * 版本号递增函数，支持 0.06 -> 0.07 这样的格式
 */
function incrementVersion(version) {
  const parts = version.split('.')
  const lastIndex = parts.length - 1
  const lastNum = parseInt(parts[lastIndex], 10)
  if (isNaN(lastNum)) {
    throw new Error(`Invalid version format: ${version}`)
  }
  const nextNum = lastNum + 1
  // 保持零填充（0.06 -> 0.07）
  const padding = parts[lastIndex].length
  parts[lastIndex] = String(nextNum).padStart(padding, '0')
  return parts.join('.')
}
/**
 * 获取上传版本号，如果指定了版本号则自动递增
 */
function getUploadVersion() {
  const baseVersion = process.env.WECHAT_UPLOAD_VERSION
  if (!baseVersion) {
    // 如果没有设置，使用时间戳方式（兼容旧逻辑）
    return `ci-${Date.now()}`
  }
  // 递增版本号
  const nextVersion = incrementVersion(baseVersion)
  // 更新环境变量，便于日志展示
  process.env.WECHAT_UPLOAD_VERSION = nextVersion
  console.log(`✓ Version incremented: ${baseVersion} -> ${nextVersion}`)
  return nextVersion
}
const uploadVersion = getUploadVersion()
const uploadDesc = process.env.WECHAT_UPLOAD_DESC || process.env.CI_COMMIT_TITLE

function ensurePrivateKey() {
  if (fs.existsSync(keyPath)) return
  const base64Key = process.env.WECHAT_PRIVATE_KEY_BASE64
  if (!base64Key) {
    throw new Error('Missing key file and WECHAT_PRIVATE_KEY_BASE64 is not set.')
  }
  const keyContent = Buffer.from(base64Key, 'base64').toString('utf8')
  fs.writeFileSync(keyPath, keyContent, { mode: 0o600 })
}

function ensureBuildOutput() {
  const configPath = path.join(outputPath, 'project.config.json')
  if (!fs.existsSync(configPath)) {
    throw new Error(`Build output not found: ${configPath}`)
  }
}

async function run() {
  ensurePrivateKey()
  ensureBuildOutput()

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath: outputPath,
    privateKeyPath: keyPath,
    ignores: ['node_modules/**/*']
  })

  const result = await ci.upload({
    project,
    version: uploadVersion,
    desc: uploadDesc,
    setting: {
      minify: true
    }
  })

  console.log('Wechat upload success')
  console.log(JSON.stringify(result, null, 2))
}

run().catch((error) => {
  console.error('Wechat upload failed')
  console.error(error)
  process.exit(1)
})
