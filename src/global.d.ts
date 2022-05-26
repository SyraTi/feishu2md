declare type FeishuDocContent = any
declare type Feishu2mdOptions = {
  app_id: string,
  app_secret: string,
  tenantToken?: string,
  outputDir?: string,
  imageDir?: string,
  fileDir?: string,
  imagePath?: string,
  filePath?: string,
}

/**
 * @typedef FileToken 飞书文件token
 *  @extends string
 */
declare type FileToken = string
/**
 * @typedef DocToken 飞书文档token
 *  @extends string
 */
declare type DocToken = string
/**
 * @typedef ExtName 后缀名
 *  @extends string
 *  @example '.png' '.mp4'
 */
declare type ExtName = string

/**
 * @typedef TenantToken 飞书应用鉴权token
 *  @extends string
 *  @example 't-06aca9595f4975f2c1fda226e7c9d3107469afa1'
 */
declare type TenantToken = string
