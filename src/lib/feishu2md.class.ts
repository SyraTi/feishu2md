/* eslint-disable no-console */
import fs = require('fs')
import path = require('path')
import https = require('https')

import FeishuBlockDumper = require('./feishu-block-dumper.class')

class Feishu2MD {
  prevIndexTree: any = {}

  options: Feishu2mdOptions = {
    app_id: '',
    app_secret: '',
    tenantToken: '',
    outputDir: path.resolve(process.cwd(), './backup'),
    imageDir: path.resolve(process.cwd(), './backup/image'),
    fileDir: path.resolve(process.cwd(), './backup/file'),
    imagePath: '',
    filePath: '',
  }

  constructor({
    // eslint-disable-next-line camelcase
    app_id, app_secret, outputDir = '', imageDir = '', fileDir = '', imagePath = '', filePath = '',
  }: Feishu2mdOptions) {
    // eslint-disable-next-line camelcase
    this.options.app_id = app_id || this.options.app_id
    // eslint-disable-next-line camelcase
    this.options.app_secret = app_secret || this.options.app_secret
    this.options.outputDir = outputDir || this.options.outputDir
    this.options.imageDir = imageDir || path.resolve(this.options.outputDir, './image')
    this.options.fileDir = fileDir || path.resolve(this.options.outputDir, './file')
    this.options.imagePath = imagePath || `${path.relative(this.options.outputDir, this.options.imageDir)}/`
    this.options.filePath = filePath || `${path.relative(this.options.outputDir, this.options.fileDir)}/`
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir)
    }

    const prevIndexTreePath = path.resolve(this.options.outputDir, './index.json')
    this.prevIndexTree = JSON.parse(fs.existsSync(prevIndexTreePath) ? (fs.readFileSync(prevIndexTreePath, 'utf-8') || '{}') : '{}')
  }

  /**
   * 找到之前目录树中已经记录的帮助文档
   * @param {string[]} sectionTitles 从顶部开始到目标文档的title数组 以此为判定依据
   * @returns {{children}|*}
   */
  // _findInPrevTree(sectionTitles) {
  //   if (this.prevIndexTree) {
  //     let nodeList = [...this.prevIndexTree];
  //     sectionTitles = [...sectionTitles];
  //     let title;
  //     let target;
  //     // eslint-disable-next-line no-cond-assign
  //     while ((title = sectionTitles.shift()) !== undefined) {
  //       // eslint-disable-next-line no-loop-func
  //       target = nodeList.find((el) => el.title === title);
  //       if (target) {
  //         nodeList = target.children || [];
  //       }
  //     }
  //     return target;
  //   }
  // }

  /**
   * 获取之前目录树中的最大ID
   * @returns {number}
   */
  // _getMaxIndexInPrevIndexTree() {
  //   if (this.prevIndexTree) {
  //     const nodeQueue = [...this.prevIndexTree];
  //     let maxIndex = 0;
  //     let node;
  //     // eslint-disable-next-line no-cond-assign
  //     while (node = nodeQueue.shift()) {
  //       if (node.path) {
  //         const index = Number(path.basename(node.path));
  //         if (index > maxIndex) {
  //           maxIndex = index;
  //         }
  //       }
  //       if (node.children) {
  //         nodeQueue.push(...node.children);
  //       }
  //     }
  //     return Number(maxIndex);
  //   }
  // }

  /**
   * 获取飞书应用token
   * @returns {Promise<TenantToken>}
   */
  // eslint-disable-next-line no-underscore-dangle
  private async _getTenantToken() : Promise<TenantToken> {
    if (this.options.tenantToken) {
      return Promise.resolve(this.options.tenantToken)
    }
    return new Promise((resolve) => {
      const data = JSON.stringify({
        app_id: this.options.app_id,
        app_secret: this.options.app_secret,
      })
      const req = https.request('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      }, (res) => {
        let rawData = ''
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          resolve(this.options.tenantToken = JSON.parse(rawData).tenant_access_token)
        })
      })
      req.write(data)
      req.end()
    })
  }

  /**
   * 获取文件
   * @param {Map<FileToken, ExtName>} extMap 需要下载的文件后缀名map， key是token， value是后缀名
   * @param {FileToken[]} tokens 文件token
   * @param {string} dir 文件下载位置
   * @param {number} retry 重试次数
   *
   * @return {Promise<any>}
   */
  async _getFile(extMap: Map<FileToken, ExtName>, tokens: FileToken[], dir: string, retry:number = 3) : Promise<any> {
    const tenantToken = await this._getTenantToken()
    dir = path.resolve(__dirname, dir)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const token = tokens.pop()
    if (!token) return Promise.resolve()
    const filename = `${token}${extMap.get(token)}`
    const filepath = path.resolve(dir, `${filename}`)
    if (fs.existsSync(filepath)) {
      console.log(`file exists! ${filepath}, ${tokens.length} left!`)
      return this._getFile(extMap, tokens, dir)
    }
    console.log(`file downloading! ${filepath}, ${tokens.length} left!`)
    const file = fs.createWriteStream(filepath)
    return new Promise((resolve) => {
      const onError = (errMsg = '') => {
        console.error(`error! token:${token}`, errMsg)
        file.close()
        fs.unlinkSync(filepath)
        if (retry > 0) {
          console.error(`retry ${retry}/3`)
          resolve(this._getFile(extMap, [...tokens, token], dir, --retry))
        } else {
          console.error('file downloading failed, exiting...')
          process.exit(1)
        }
      }
      const req = https.get(`https://open.feishu.cn/open-apis/drive/v1/medias/${token}/download`, {
        timeout: 10e3,
        headers: {
          Authorization: `Bearer ${tenantToken}`,
        },
      }, (res) => {
        if (res.statusCode !== 200) {
          let rawData = ''
          res.on('data', (chunk) => {
            rawData += chunk
          })
          res.on('end', () => {
            onError(rawData)
          })
        } else {
          res.pipe(file)
          res.on('end', () => {
            file.close()
            resolve(this._getFile(extMap, tokens, dir))
          })
        }
        res.on('error', () => {
          onError()
        })
      })
      req.on('timeout', () => {
        onError('timeout!')
      })
    })
  }

  /**
   * 获取文档内容
   * @param {DocToken} docToken 文档token
   * @param {TenantToken} tenantToken 飞书应用token
   * @returns {Promise<FeishuDocContent>}
   */
  private async _getDocContent(docToken: DocToken): Promise<FeishuDocContent> {
    const tenantToken = await this._getTenantToken()
    return new Promise((resolve) => {
      https.get(`https://open.feishu.cn/open-apis/doc/v2/${docToken}/content`, {
        headers: {
          Authorization: `Bearer ${tenantToken}`,
        },
      }, (res) => {
        let rawData = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          resolve(JSON.parse(JSON.parse(rawData).data.content))
        })
      })
    })
  }

  /**
   * 导出文档为MD
   * @param {DocToken} docToken 文档token
   * @param {Partial<Feishu2mdOptions>} options feishu2md配置对象，可以在此处覆盖一些全局配置
   */
  async export(docToken, options:Partial<Feishu2mdOptions> = {}) {
    const tenantToken = await this._getTenantToken()
    const docContent = await this._getDocContent(docToken)

    options = { ...this.options, ...options }

    const dumper = new FeishuBlockDumper({
      imagePath: options.imagePath,
      filePath: options.filePath,
      tenantToken,
    })

    const mds = [{ index: 0, content: [] }]
    const indexTree = []
    for (const block of docContent.body.blocks) {
      const isHeading = block.type === 'paragraph' && block.paragraph.style && block.paragraph.style.headingLevel
      // eslint-disable-next-line eqeqeq
      if (isHeading && block.paragraph.style.headingLevel == 1) {
        const title = block.paragraph.elements.filter((el) => el.type === 'textRun').map((el) => el.textRun.text).join('')
        indexTree.push({
          level: 1,
          title,
          path: '',
          children: [],
        })
      }
      // eslint-disable-next-line eqeqeq
      if (isHeading) {
        // 子标题前加\n 防止影响前文的解析
        mds[mds.length - 1].content.push(`\n${await dumper.walk(block)}`)
      } else if (mds.length) {
        let result = `\n${await dumper.walk(block)}`
        const isList = block.type === 'paragraph' && block.paragraph.style
          && block.paragraph.style.list
        // 列表项不需要br
        // img和iframe table都呈现为块级元素，所以不需要br来换行
        if (!isList && !['gallery', 'file', 'table', 'sheet'].includes(block.type)) {
          result += '<br>'
        }
        mds[mds.length - 1].content.push(result)
      }
    }
    mds.forEach((mdItem) => {
      const markdown = mdItem.content.join('\n')
      fs.writeFileSync(path.resolve(options.outputDir, `./${docToken}_${mdItem.index}.md`), markdown)
    })
    await this._getFile(
      dumper.fileTokens,
      Array.from(dumper.fileTokens.keys()),
      path.resolve(options.outputDir, options.fileDir),
    )
    await this._getFile(
      dumper.imageTokens,
      Array.from(dumper.imageTokens.keys()),
      path.resolve(options.outputDir, options.imageDir),
    )

    return {
      indexTree,
    }
  }
}

export = Feishu2MD
