const { exec } = require('child_process');
const os = require('os');

console.log('\n🔍 Checking MySQL Installation...\n');

const platform = os.platform();

function checkMySQL() {
  const command = platform === 'win32' ? 'where mysql' : 'which mysql';
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ MySQL is not installed or not in PATH\n');
      printInstallInstructions();
      return;
    }
    
    console.log('✅ MySQL found at:', stdout.trim());
    checkMySQLService();
  });
}

function checkMySQLService() {
  console.log('\n🔍 Checking MySQL service status...\n');
  
  let command;
  if (platform === 'win32') {
    command = 'sc query MySQL80 || sc query MySQL';
  } else if (platform === 'darwin') {
    command = 'brew services list | grep mysql';
  } else {
    command = 'systemctl status mysql';
  }
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  MySQL service not found or not running\n');
      printStartInstructions();
      return;
    }
    
    if (stdout.includes('RUNNING') || stdout.includes('running') || stdout.includes('active')) {
      console.log('✅ MySQL service is running!\n');
      console.log('✨ You can now run: npm run setup-db\n');
    } else {
      console.log('⚠️  MySQL service is not running\n');
      printStartInstructions();
    }
  });
}

function printInstallInstructions() {
  console.log('📦 MySQL Installation Instructions:\n');
  
  if (platform === 'win32') {
    console.log('Windows:');
    console.log('1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/');
    console.log('2. Run the installer and choose "Developer Default"');
    console.log('3. Set root password during installation');
    console.log('4. Complete the installation\n');
    console.log('Alternative - Using Chocolatey:');
    console.log('   choco install mysql\n');
  } else if (platform === 'darwin') {
    console.log('macOS:');
    console.log('Using Homebrew (recommended):');
    console.log('   brew install mysql');
    console.log('   brew services start mysql\n');
  } else {
    console.log('Linux:');
    console.log('Ubuntu/Debian:');
    console.log('   sudo apt update');
    console.log('   sudo apt install mysql-server');
    console.log('   sudo systemctl start mysql\n');
    console.log('CentOS/RHEL:');
    console.log('   sudo yum install mysql-server');
    console.log('   sudo systemctl start mysqld\n');
  }
}

function printStartInstructions() {
  console.log('🚀 Start MySQL Service:\n');
  
  if (platform === 'win32') {
    console.log('Windows:');
    console.log('   net start MySQL80');
    console.log('   or');
    console.log('   net start MySQL\n');
  } else if (platform === 'darwin') {
    console.log('macOS:');
    console.log('   brew services start mysql\n');
  } else {
    console.log('Linux:');
    console.log('   sudo systemctl start mysql\n');
  }
  
  console.log('Then run: npm run setup-db\n');
}

checkMySQL();
