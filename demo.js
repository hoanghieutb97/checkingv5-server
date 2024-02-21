const { exec } = require('child_process');

// Để tắt một ứng dụng có tên là "example.exe"
exec('taskkill /IM photoshop.exe', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
