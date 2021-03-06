
// Imports
var os = require('os');
var fs = require('fs');
var path = require('path');
var innerProcess = require('child_process');
var SDB_NAME = (process.platform == 'win32') ? 'sdb.exe' : 'sdb';

// Random ID generator
var PSEUDO_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
    'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
    'y', 'z'];


/**
   Functions perform mode:
   COMMAND: Using when <Debug on ...> etc. commands
   DEBUGGER: Using when other commands except debug
**/
var ENUM_FUNCTION_MODE = {
    'COMMAND': 0,                       // Run on TV 2.4
    'DEBUGGER': 1,                      // Debug on TV 3.0
	'WEB_INSPECTOR_ON_TV': 2,             // Web Inspector Debug on TV
	'WEB_INSPECTOR_ON_EMULATOR': 3,    // Web Inspector Debug on Emulator
	'RUNNING_TIZEN2_4_EMULATOR': 4,      // Run on Emulator 2.4
    'DEBUGGER_TIZEN3_0_EMULATOR': 5    // Debug on Emulator 3.0
};
exports.ENUM_COMMAND_MODE = ENUM_FUNCTION_MODE;
var functionMode = ENUM_FUNCTION_MODE.COMMAND;


/**
   Window message level:
   ERROR: Show error message on window
   INFO: Show information message on window
**/
var ENUM_WINMSG_LEVEL = {
    'ERROR': 0,
    'WARNING': 1,
    'INFO': 2
};
exports.ENUM_WINMSG_LEVEL = ENUM_WINMSG_LEVEL;


/**
   Extension states:
   STOPPED: The State bfore SDB etc. tools started
   INITIALIZED: The State when tools running
   RUNNING: <not used>
**/
var ENUM_EXTENSION_STATE = {
    'STOPPED': 0,
    'INITIALIZED': 1,
    'RUNNING': 2
};
exports.ENUM_EXTENSION_STATE = ENUM_EXTENSION_STATE;
var extention_state = ENUM_EXTENSION_STATE.STOPPED;

// Alert an information message 
function showMsgOnWindow(msgLevel, msg) {

    if (functionMode != ENUM_FUNCTION_MODE.DEBUGGER && functionMode != ENUM_FUNCTION_MODE.DEBUGGER_TIZEN3_0_EMULATOR) {
        
        if (msgLevel == ENUM_WINMSG_LEVEL.INFO) {
            console.log(msg);
        }
        else if (msgLevel == ENUM_WINMSG_LEVEL.WARNING) {
            console.log(msg);
        }
        else if (msgLevel == ENUM_WINMSG_LEVEL.ERROR) {
            console.log(msg);
        }
        else {
            // Do nothing
        }
    }
    else {
        // TODO: logic when debug
    }
}
exports.showMsgOnWindow = showMsgOnWindow;

// Get the directory path of workspace
function getWorkspacePath() {

    if (functionMode != ENUM_FUNCTION_MODE.DEBUGGER && functionMode != ENUM_FUNCTION_MODE.DEBUGGER_TIZEN3_0_EMULATOR) {
       var dir = __dirname;
        var endIndex = dir.indexOf('/node_modules/tv-dev-cli-sdk');
        return dir.slice(0, endIndex);
        
    }
    else {
        // TODO: logic when debug
    }
}
exports.getWorkspacePath = getWorkspacePath;

// Get tizen-studio sdb path 
function getTizenStudioSdbPath(){
    if (functionMode != ENUM_FUNCTION_MODE.DEBUGGER && functionMode != ENUM_FUNCTION_MODE.DEBUGGER_TIZEN3_0_EMULATOR) {
        //vscode = require('vscode');
        //var sdbPath = vscode.workspace.getConfiguration('tizentv')['tizenStudioLocation'] + '/tools/' + SDB_NAME;
        return; sdbPath;
    }else {
        // TODO: logic when debug
    }

}
exports.getTizenStudioSdbPath = getTizenStudioSdbPath;


// Get target device's IP and port
function getTargetIp() {

    if (functionMode != ENUM_FUNCTION_MODE.DEBUGGER && functionMode != ENUM_FUNCTION_MODE.DEBUGGER_TIZEN3_0_EMULATOR) {
        //vscode = require('vscode');
        return '109.123.120.89';//vscode.workspace.getConfiguration('tizentv')['targetDeviceAddress'];
    }
    else {
        // TODO: logic when debug
    }
}
exports.getTargetIp = getTargetIp;

// Generate random Web App's package ID
function GetRandomNum(n) {

    var res = '';

    for (var i = 0; i < n; i++) {
        var id = Math.round(Math.random() * 61);
        res += PSEUDO_CHARS[id];
    }
    return res;
}
exports.GetRandomNum = GetRandomNum;

// Insert ID into 'config.xml' of App
function writeConfigXml(applicationid, packageid, path) {

    var data = fs.readFileSync(path, 'utf-8');
    var updatedData = '';

    if (data) {
        var idPos = data.indexOf('application id=');
        var packagePos = data.indexOf('package=');
        var substring1 = data.substring(0, idPos + 16);
        var substring2 = data.substring(packagePos - 2, packagePos + 9);
        var substring3 = data.substring(packagePos + 9, data.length);
        updatedData = substring1 + applicationid + substring2 + packageid + substring3;
    }
    fs.writeFileSync(path, updatedData, 'utf-8');

}
exports.writeConfigXml = writeConfigXml;

//Read web app id from config.xml file
function getConfAppID(xmlfile) {

    var applicationID = '';

    if (fs.existsSync(xmlfile)) {

        var data = fs.readFileSync(xmlfile, 'utf-8');
        //console.log(data);   
        if (data) {
            var id_pos = data.indexOf('application id');
            var package_pos = data.indexOf('package');
            applicationID = data.substring(id_pos + 16, package_pos - 2);
            console.log('applicationID=' + applicationID);
        }

    } else { 
    }

    return applicationID;
}
exports.getConfAppID = getConfAppID;

// Get package ID by remove postfix of App ID
function getPackageID(appId) {

    var packageID = '';
    var packageIDArray = appId.split('.');
    var packageID = '';

    if (packageIDArray) {
        packageID = packageIDArray[0];
    }

    return packageID;
}
exports.getPackageID = getPackageID;

// Get the Tizen version of target device
function getTargetVersion(command) {

    var targetversion = '';

    try {

        var data = innerProcess.execSync(command);
        //console.log('cat result:' + data);
        if (data.indexOf('platform_version:2.4') >= 0) {
            targetversion = '2.4';
        }else if(data.indexOf('platform_version:3.0') >= 0) {
            targetversion = '3.0';
        }else{
            targetversion = '3.0';
        }
    } catch (ex) {     
        showMsgOnWindow(ENUM_WINMSG_LEVEL.ERROR, 'Get target version Error occured , Please check');
        console.log('-------Error:---------' + ex);
        throw ex;
    }

    return targetversion;
}
exports.getTargetVersion = getTargetVersion;

// Set functions mode, Command or Debugger
function setFuncMode(mode) {

    functionMode = mode;
}
exports.setFuncMode = setFuncMode;

// Get functions mode, Command or Debugger
function getFuncMode() {

    return functionMode;
}
exports.getFuncMode = getFuncMode;

// Set the Running state of Extension
function setExtensionState(flag) {

    extention_state = flag;
}
exports.setExtensionState = setExtensionState;

// Get the running state of Extension
function getExtensionState() {

    return extention_state;
}
exports.getExtensionState = getExtensionState;

// Sleep a time in milli seconds
function sleepMs(milliSeconds) {

    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);

}
exports.sleepMs = sleepMs;

//Read web app id from config.xml file
function getConfStartHtml(xmlfile) {

    var configuredStartHtml = '';

    if (fs.existsSync(xmlfile)) {

        var data = fs.readFileSync(xmlfile, 'utf-8');
        //console.log(data);   
        if (data) {
            var pro_pos = data.indexOf('content src');
            var start_pos = data.indexOf('\"', pro_pos);
            if (start_pos >= 0)
            {
                var end_pos = data.indexOf('\"', start_pos + 1);
                if (end_pos > 0)
                {
                    configuredStartHtml = data.substring(start_pos + 1, end_pos);   
                }
            }

            console.log('configuredStartHtml=' + configuredStartHtml);
        }

    } else {
    }

    return configuredStartHtml;
}
exports.getConfStartHtml = getConfStartHtml;


// Insert <name> value into 'config.xml' of App
function writeConfigXmlNameAttr(nameId, path) {    

	if (fs.existsSync(path)) {
		var data = fs.readFileSync(path, 'utf-8');
		var updatedData = '';
	
		if (data) {
			var nameStartPos = data.indexOf('<name>');
			var nameEndPos = data.indexOf('</name>');
			var substring1 = data.substring(0, nameStartPos + 6);
			var substring2 = data.substring(nameEndPos, data.length);
			updatedData = substring1 + nameId + substring2;
		}
		fs.writeFileSync(path, updatedData, 'utf-8');
	}
}
exports.writeConfigXmlNameAttr = writeConfigXmlNameAttr;


function createDir(dirPath){
    if (!fs.existsSync(dirPath)){
        console.log('Create dir path:'+dirPath);
        try{        
            fs.mkdirSync(dirPath);           
        } catch (ex) {
            console.log(ex.message);
            throw ex;
        }
        
    }else{
        console.log(dirPath+' is exist');
    }
}
exports.createDir = createDir;

