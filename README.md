# feishu2md

[中文文档](./README.zh-CN.md)

Convert Feishu Document to Markdown.

## Usage:

feishu2md has 2 kinds of usage.

### clone
1. run ```git clone https://github.com/SyraTi/feishu2md```
2. run ```yarn install```
3. Copy ```config.sample.js``` to ```config.js```
4. Fill your info in ```config.js````` @see [config.js](#configjs)
5. run ```yarn backup```
6. find your md files under /backup folder.

### npm package

> ```npm install feishu2md --save-dev``` or ```yarn add feishu2md```

```js
const feishu2md = new Feishu2MD({
  app_id: 'your app_id',
  app_secret: 'your app_secret',
  // ... other optional params, see Feishu2mdOptions 
});
await feishu2md.export('feishu doc token1')
await feishu2md.export('feishu doc token2')
//...
```
## Feishu2mdOptions
```ts
declare type Feishu2mdOptions = {
  app_id: string, // feishu app_id
  app_secret: string, // feishu app_secret
  outputDir?: string, // docs output dir, @default '/backup/'
  imageDir?: string, // image output dir, @default '/backup/image'
  fileDir?: string, // file（videos etc.）output dir @default '/backup/file'
  imagePath?: string, // image src path in md files， @default path.relative(outputDir, imageDir) + '/'
  filePath?: string, // file src path in md files， @default path.relative(outputDir, fileDir) + '/'
}
```

## config.js

```js
module.exports = {
  app_id: 'your app_id', // {string} feishu app_id
  app_secret: 'your app_secret', // {string} feishu app_secret
  docToken: 'feishu doc token' || ['token1', 'token2'], // {string|string[]} feishu document token
  // 可选参数 ↓
  outputDir: 'absolute_path/to/docs', // {string} docs output dir, @default '/backup/'
  imageDir: 'absolute_path/to/image', // {string}  image output dir, @default '/backup/image'
  fileDir: 'absolute_path/to/file', // {string} file（videos etc.）output dir @default '/backup/file'
  imagePath: 'http://url.com/image/', // {string} image src path in md files， @default path.relative(outputDir, imageDir) + '/'
  filePath: 'http://url.com/file/', // {string} file src path in md files， @default path.relative(outputDir, fileDir) + '/'
}
```
