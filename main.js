const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const express = require('express');
const startApp = express();
var cors = require('cors')
var bodyParser = require('body-parser')
const path = require('path');
const iconPath = path.join(__dirname, 'assets/a.ico');

startApp.use(cors())
startApp.use(bodyParser.json())
startApp.listen(3004, () => {
  console.log('Url successfully started...')
})
startApp.get("/getPrinterList", (req, res, next) =>  {
  let printerList =  win1.webContents.getPrinters();
  res.send(200,printerList);
})
startApp.post("/print", (req, res, next) => {
   
  let content  = req.body.content;
  
  res.send(200,{});
  win1.webContents.send('readyprint', content);
 // res.sendFile('index.html', { root: __dirname })
 //res.status(200);
})
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let win1;


function createWorkerWindow(){
  win1 = new BrowserWindow({
    // width: 500,
    // height: 600,
    minWidth: 230,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true
    },icon: iconPath 
  })
  
  win1.loadURL("file://" + __dirname + "/worker.html");
  win1.hide();
  win1.on("closed", () => {
    win1 = undefined;
  });
  ipcMain.on('readyprintfinal', (e) => {
  
    win1.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: '' ,
    })
 
  })

  win1.webContents.openDevTools()

}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  //create worker window
  createWorkerWindow();

    const appIcon = new Tray(iconPath)

    const ContextMenu = Menu.buildFromTemplate([
      {
        label: 'Hide/Show App', click: () => {
          win.show();
        }
      },
      {
        label: 'Quit App', click: () => {
          app.isQuiting = true
          app.quit();
        }
      }
    ])

    appIcon.setContextMenu(ContextMenu)
    win.on('close', (e) => {
      app.quit();
    })

    win.on('minimize', (e) => {
      e.preventDefault();
      win.hide()
    })

    win.on('show', (e) => {
      appIcon.setHighlightMode('always')
    })


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.