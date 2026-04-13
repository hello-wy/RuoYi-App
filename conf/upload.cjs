const fs = require('node:fs')
const path = require('node:path')
const ci = require('miniprogram-ci')

const appid = process.env.WECHAT_APPID || 'wx0ac1366c34e4ce68'
const uploadVersion = process.env.WECHAT_UPLOAD_VERSION || `ci-${Date.now()}`
const uploadDesc = process.env.WECHAT_UPLOAD_DESC || `yunxiao auto upload ${new Date().toISOString()}`
const outputPath = process.env.WECHAT_PROJECT_PATH || path.join(process.cwd(), 'dist/build/mp-weixin')
const keyPath = process.env.WECHAT_PRIVATE_KEY_PATH || path.join(process.cwd(), `conf/private.${appid}.key`)

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
