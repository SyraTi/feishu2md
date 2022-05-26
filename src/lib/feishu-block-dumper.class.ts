/* eslint-disable no-console */
import path = require('path')
import https = require('https')

/**
 * @class FeishuBlockDumper
 * 飞书云文档转换
 * @desc 基于Python库 jiegec/feishu-backup 移植， 如有需要扩展的功能可以先参考此库
 * @see https://github.com/jiegec/feishu-backup
 *
 * @property {Map<FileToken, ExtName>} imageTokens 需要下载的图片token，使用map是为了去重
 * @property {Map<FileToken, ExtName>} fileTokens 需要下载的文件token，使用map是为了去重
 * @property {string} imagePath 用于填充markdown图片路径的前缀
 * @property {string} filePath 用于填充markdown文件路径的前缀
 * @property {TenantToken} tenantToken 飞书应用鉴权token
 *
 * @author SyraTi <flandrescarlet@koumakan.vip>
 */
class FeishuBlockDumper {
  filePath: string

  imagePath: string

  tenantToken: string

  imageTokens: Map<string, string>

  fileTokens: Map<string, string>

  constructor({ imagePath, filePath, tenantToken }) {
    this.filePath = filePath || path.resolve(__dirname, './files')
    this.imagePath = imagePath || path.resolve(__dirname, './images')
    this.tenantToken = tenantToken || ''
    // 用map是为了去重
    this.imageTokens = new Map()
    this.fileTokens = new Map()
  }

  static renderMarkdownTable(data) {
    let text
    text = ''

    data.forEach((row, i) => {
      text += '|'
      for (const col of row) {
        text += ' '
        if (Array.isArray(col)) {
          text += col.map((v) => v.text).join('')
        } else {
          text += col.toString()
        }
        text += ' |'
      }
      text += '\n'

      if (i === 0) {
        text += '| '
        text += Array(row.length).fill('---').join(' | ')
        text += ' |\n'
      }
    })

    return text
  }

  // eslint-disable-next-line class-methods-use-this
  printTextRun(data) {
    const { textRun } = data
    let text = textRun.text.replace(/\*/g, '\\*')
    if (textRun.style) {
      const { style } = textRun
      if (style.bold) {
        // 这里不使用md加粗语法是因为飞书的加粗可能会有相邻的情况
        // 如：
        // **文本1****文本2****文本3**， 如果使用空格分隔的话 所有的加粗文本会被添加两侧的空格
        text = `<strong>${text}</strong>`
      }
      if (style.link) {
        text = `[${text}](${style.link.url})`
      }
    }
    return text
  }

  async printParagraph(data) {
    const { paragraph } = data
    let text = ''

    for (const element of paragraph.elements) {
      text += await this.walk(element)
    }

    if (paragraph.style) {
      const { style } = paragraph

      if (style.headingLevel) {
        const { headingLevel } = style
        text = `${Array(headingLevel).fill('#').join('')} ${text}`
      }

      if (style.list) {
        const l = style.list

        if (l.type === 'checkBox') {
          text = `- [ ] ${text}`
        } else if (l.type === 'checkedBox') {
          text = `- [x] ${text}`
        } else if (l.type === 'number') {
          text = `${l.number}. ${text}`
        } else if (l.type === 'bullet') {
          text = `- ${text}`
        }
      }
    }

    return text
  }

  printGallery(data) {
    const images = data.gallery.imageList
    let text = ''

    for (const image of images) {
      const token = image.fileToken
      const fileName = `${token}.png`
      this.imageTokens.set(token, '.png')
      text += `![](${this.imagePath}${fileName})`
    }

    return text
  }

  printFile(data) {
    const token = data.file.fileToken
    const extname = path.extname(data.file.fileName)
    const fileName = `${token}${extname}`
    this.fileTokens.set(token, extname)
    if (extname === '.mp4') {
      // playsinline 是为了解决ios自动全屏
      // preload=metadata以及#0.001是为了解决ios不自动加载预览的问题
      return `<video src="${path.resolve(this.filePath, fileName)}#t=0.001" controls playsinline preload="metadata"></video>`
    }
    return `<iframe src="${path.resolve(this.filePath, fileName)}" allowfullscreen></iframe>`
  }

  async printTable(data) {
    const rows = data.table.tableRows
    const tableData = []

    for (const row of rows) {
      const cells = row.tableCells
      const rowData = []
      for (const cell of cells) {
        const { body } = cell
        const { blocks } = body
        let cellContent = ''

        if (blocks !== null) {
          for (const block of blocks) {
            cellContent += await this.walk(block)
          }
        }
        rowData.push(cellContent)
      }
      tableData.push(rowData)
    }
    return FeishuBlockDumper.renderMarkdownTable(tableData)
  }

  async printSheet(data) {
    const sheetToken = data.sheet.token
    const token = sheetToken.split('_')[0]
    const sheetId = sheetToken.split('_')[1]
    return new Promise((resolve) => {
      https.get(`https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${token}/values/${sheetId}?dateTimeRenderOption=FormattedString`, {
        headers: {
          Authorization: `Bearer ${this.tenantToken}`,
        },
      }, (res) => {
        let rawData = ''
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          const content = JSON.parse(rawData).data
          const { values } = content.valueRange
          resolve(FeishuBlockDumper.renderMarkdownTable(values))
        })
      })
    })
  }

  async walk(data) {
    switch (data.type) {
      case 'paragraph':
        return this.printParagraph(data)
      case 'textRun':
        return this.printTextRun(data)
      case 'file':
        return this.printFile(data)
      case 'gallery':
        return this.printGallery(data)
      case 'table':
        return this.printTable(data)
      case 'sheet':
        return this.printSheet(data)
      default:
        console.log(`Unhandled data type ${data.type}`)
        console.log(data)
        return ''
    }
  }
}

export = FeishuBlockDumper
