//base by HANSTZ
//YouTube: @HANSTZ-TECH
//Whatsapp https://wa.me/255756530143
//GitHub: @Mrhanstz
//WhatsApp: https://whatsapp.com/channel/0029VasiOoR3bbUw5aV4qB31
//want more free bot scripts? follow my channel : https://whatsapp.com/channel/0029VasiOoR3bbUw5aV4qB31

const { spawn } = require('child_process');
const path = require('path');
function start() {
   let p = spawn(process.argv[0], [path.join(__dirname, 'main.js'), ...process.argv.slice(2)], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })
   .on('message', data => data === 'reset' && (p.kill(), start(), delete p))
   .on('exit', code => ['.', 1, 0].includes(code) && start());
}
start();