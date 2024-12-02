const webview = require('webview');

// 启动 Node.js 服务
const { exec } = require('child_process');
exec('node server.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`exec error: ${err}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

// 创建并运行 WebView
webview({ url: 'http://localhost:3000', width: 800, height: 600 });
