# feishu2md

[中文文档](./README.zh-CN.md)

Convert Feishu Document to Markdown.

## Usage:

feishu2md has 2 kinds of usage.

### clone
> 1. run ```git clone https://github.com/SyraTi/feishu2md```
> 2. run ```yarn install```
> 3. Copy ```config.sample.js``` to ```config.js```
> 4. Fill your info in ```config.js`````
> 5. run ```yarn backup```
> 6. find your md files under /backup folder.

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
  outputDir?: string,
  imageDir?: string,
  fileDir?: string,
  imagePath?: string,
  filePath?: string,
}
```

## Config:

```js
module.exports = {
  app_id: 'your app_id', // {string} feishu app_id
  app_secret: 'your app_secret', // {string} feishu app_secret
  docToken: 'feishu doc token' || ['token1', 'token2'], // {string|string[]} feishu document token
  // optional params ↓


}
```
