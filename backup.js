const config = require('./config')
const { Feishu2MD } = require('./dist/index')

const feishu2md = new Feishu2MD({
  app_id: config.app_id,
  app_secret: config.app_secret,
});

(async () => {
  if (Array.isArray(config.docToken)) {
    for (const token of config.docToken) {
      await feishu2md.export(token)
    }
  } else await feishu2md.export(config.docToken)
})()
