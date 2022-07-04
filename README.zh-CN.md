# feishu2md
使用飞书API将飞书云文档转换为markdown


## 使用方法:

feishu2md 有两种使用方法.

### clone
1. 运行 ```git clone https://github.com/SyraTi/feishu2md```
2. 运行 ```yarn install```
3. 将 ```config.sample.js``` 复制为 ```config.js```
4. 在 ```config.js``` 中填写信息， 见[config.js](#configjs)
5. 运行 ```yarn backup```
6. 备份完成的文件可以在```/backup```文件夹下找到.

### npm包

> ```npm install feishu2md --save-dev``` 或 ```yarn add feishu2md```

```js
const feishu2md = new Feishu2MD({
  app_id: '飞书 app_id',
  app_secret: '飞书 app_secret',
  // ... 其他可选的参数, 见 Feishu2mdOptions 
});
await feishu2md.export('飞书 文档 token1')
await feishu2md.export('飞书 文档 token2')
//...

```
## Feishu2mdOptions
```ts
declare type Feishu2mdOptions = {
  app_id: string, // 飞书 app_id
  app_secret: string, // 飞书 app_secret
  outputDir?: string, // 文档输出目录 默认值为 /backup/
  imageDir?: string, // 图片输出目录 默认值为 /backup/image
  fileDir?: string, // 文件（视频等）输出目录 默认值为 /backup/file
  imagePath?: string, // 在md文件中image的src路径， md文件中默认路径为 path.relative(outputDir, imageDir) + '/'
  filePath?: string, // 在md文件中file的src路径， md文件中默认路径为 path.relative(outputDir, fileDir) + '/'
}
```

## config.js

```js
module.exports = {
  app_id: 'your app_id', // {string} 飞书 app_id
  app_secret: 'your app_secret', // {string} 飞书 app_secret
  docToken: 'feishu doc token' || ['token1', 'token2'], // {string|string[]} 飞书文档 token
  // 可选参数 ↓
  outputDir: 'absolute_path/to/docs', // {string} 文档输出目录 默认值为 /backup/
  imageDir: 'absolute_path/to/image', // {string} 图片输出目录 默认值为 /backup/image
  fileDir: 'absolute_path/to/file', // {string} 文件（视频等）输出目录 默认值为 /backup/file
  imagePath: 'http://url.com/image/', // {string} 在md文件中image的src路径， md文件中默认路径为 path.relative(outputDir, imageDir) + '/'
  filePath: 'http://url.com/file/', // {string} 在md文件中file的src路径， md文件中默认路径为 path.relative(outputDir, fileDir) + '/'
}
```
