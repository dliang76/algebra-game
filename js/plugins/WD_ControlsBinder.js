//=============================================================================
// Plugin Name: WD Keyboard and Controller binding
// Author: Winthorp Darkrites (Winter Dream Games Creator)
// Description: Creates an option menu to bind both keyboard and controller
// Terms of Use: By using this plugin you agree at our ToU (https://drive.google.com/file/d/1lG2Lep2Unme80ghZD7-fA-hPGWKLsiR7/view)
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Keyboard and Controller binding
 * @author Winthorp Darkrites
 * @url https://ko-fi.com/winterdream
 *
 * @param textLine
 * @text === Text Options ===
 * @desc Set the preferred text!
 * @default ==============
 *
 * @param stringTranslation
 * @text General Text Settings
 * @parent textLine
 * @type struct<textSettings>
 * @desc Choose the general text
 * @default {"optionText":"Key Binding","missingKey":"MISSING!!","reset":"Reset to Default","undo":"Undo","save":"Save"}
 *
 * @param keyTranslation
 * @parent textLine
 * @type struct<keySettings>
 * @desc Choose the key text
 * @default {"tab":"Tab","ok":"Ok","shift":"Shift","control":"Control","escape":"Escape","pageup":"Page Up","pagedown":"Page Down","left":"Left","up":"Up","right":"Right","down":"Down","menu":"Menu","cancel":"Cancel","keyboard":"Keyboard","controller":"Controller"}
 *
 * @param graphLine
 * @text === Graphics Options ===
 * @desc Choose the pictures (if wanted)!
 * @default ==============
 *
 * @param keyPic
 * @type file
 * @dir img/pictures
 * @text Keyboard Picture
 * @parent graphLine
 * @desc Choose the picture for the keyboard
 * @default
 * 
 * @param padPic
 * @type file
 * @dir img/pictures
 * @text Controller Picture
 * @parent graphLine
 * @desc Choose the picture for the controller
 * @default
 * 
 * @param compLine
 * @text === Compatibility Options ===
 * @desc Set the compatibility options!
 * @default ==============
 *
 * @param compatibilityOptionsMenuFlag
 * @type boolean
 * @text Handle Compatibility Options?
 * @parent compLine
 * @desc If true expand the options window to 8 elements + additional value, if false let another plugin handle it
 * @default true
 * 
 * @param compatibilityOptionsMenuAddition
 * @parent compLine
 * @type number
 * @text Additional option slots
 * @desc If you have other plugin options, add 1 for each (max classic RMMZ additional values is 4)
 * @default 0
 * 
 * @help FILENAME.js
 *
 * This plugin adds a Keyboard and Controller binding page in
 * the game options
 * 
 * You can find more scripts and games on my Ko-Fi page:
 * https://ko-fi.com/winterdream
 * and on my Itch.io page:
 * https://winterdreamgamescreator.itch.io/
 *
 * By using this plugin you accept the Terms of Use (https://drive.google.com/file/d/1l_GadoZh3ylSvRm4hAoT2WOUXTpePpHf/view?usp=sharing)
 * //////////////////////////////////////////////////
 * VERSION 1.0:
 * - Initial Release
 * //////////////////////////////////////////////////
 *
 */
/*~struct~textSettings:
 * @param optionText
 * @text Options Menu Command Name
 * @desc The name of the command button in the options
 * @default Key Binding
 * 
 * @param missingKey
 * @text Missing key warning
 * @desc What appears if there is no key set for the action
 * @default MISSING!!
 * 
 * @param reset
 * @text Reset keys
 * @desc The text for the reset command
 * @default Reset to Default
 * 
 * @param undo
 * @text Undo changes
 * @desc The text to exit without saving changes
 * @default Undo
 * 
 * @param save
 * @text Save changes
 * @desc The text to sace changes
 * @default Save
 */
/*~struct~keySettings:
 * @param tab
 * @text Tab key action (Keyboard only)
 * @desc The description of the action associated to the tab command
 * @default Tab
 * 
 * @param ok
 * @text Ok key action
 * @desc The description of the action associated to the ok command
 * @default Ok
 * 
 * @param shift
 * @text Shift key action
 * @desc The description of the action associated to the shift command
 * @default Shift
 * 
 * @param control
 * @text Control key action
 * @desc The description of the action associated to the control command
 * @default Control
 * 
 * @param escape
 * @text Escape key action (Keyboard only)
 * @desc The description of the action associated to the escape command
 * @default Escape
 * 
 * @param pageup
 * @text Page Up key action
 * @desc The description of the action associated to the Page Up command
 * @default Page Up
 * 
 * @param pagedown
 * @text Page Down key action
 * @desc The description of the action associated to the Page Down command
 * @default Page Down
 * 
 * @param left
 * @text Left key action
 * @desc The description of the action associated to the Left command
 * @default Left
 * 
 * @param up
 * @text Up key action
 * @desc The description of the action associated to the Up command
 * @default Up
 * 
 * @param right
 * @text Right key action
 * @desc The description of the action associated to the Right command
 * @default Right
 * 
 * @param down
 * @text Down key action
 * @desc The description of the action associated to the Down command
 * @default Down
 * 
 * @param menu
 * @text Menu key action (Controller only)
 * @desc The description of the action associated to the Menu command
 * @default Menu
 * 
 * @param cancel
 * @text Cancel key action (Controller only)
 * @desc The description of the action associated to the Cancel command
 * @default Cancel
 * 
 * @param keyboard
 * @text Keyboard translation
 * @desc Indicates the side of the Keyboard key binding
 * @default Keyboard
 * 
 * @param controller
 * @text Controller translation
 * @desc Indicates the side of the Gamepad key binding
 * @default Controller
 */

 var $dataWDControlsBinder=null;DataManager._databaseFiles.push({name:"$dataWDControlsBinder",src:"WD_ControlsBinder.json"}),function(){const e=PluginManager.parameters("WD_ControlsBinder"),t="true"===e.compatibilityOptionsMenuFlag,n=parseInt(e.compatibilityOptionsMenuAddition)||0,i=H(e.stringTranslation),a=H(e.keyTranslation),o={keyPicPath:e.keyPic||"",conPicPath:e.padPic||""},r=["up","down","left","right","ok","escape","shift","pageup","pagedown","control","tab"],s=["ok","cancel","shift","pageup","pagedown","menu"];let c,l,p=0,u=[],h={},d={},y={},k={},v=0;const w={9:"tab",13:"ok",16:"shift",17:"control",18:"control",27:"escape",32:"ok",33:"pageup",34:"pagedown",37:"left",38:"up",39:"right",40:"down",45:"escape",81:"pageup",87:"pagedown",88:"escape",90:"ok",96:"escape",98:"down",100:"left",102:"right",104:"up",120:"debug"},f={0:"ok",1:"cancel",2:"shift",3:"menu",4:"pageup",5:"pagedown",12:"up",13:"down",14:"left",15:"right"},g=[{value:8,key:"Backspace"},{value:9,key:"Tab"},{value:13,key:"Enter"},{value:16,key:"Left Shift"},{value:16,key:"Right Shift"},{value:17,key:"Left Ctrl"},{value:17,key:"Right Ctrl"},{value:18,key:"Left Alt"},{value:18,key:"Right Alt"},{value:19,key:"Pause - Break"},{value:20,key:"Caps Lock"},{value:27,key:"Escape"},{value:32,key:"Space"},{value:33,key:"Page up"},{value:34,key:"Page down"},{value:35,key:"End"},{value:36,key:"Home"},{value:37,key:"Left arrow"},{value:38,key:"Up arrow"},{value:39,key:"Right arrow"},{value:40,key:"Down arrow"},{value:44,key:"Print screen"},{value:45,key:"Insert"},{value:46,key:"Delete"},{value:48,key:0},{value:49,key:1},{value:50,key:2},{value:51,key:3},{value:52,key:4},{value:53,key:5},{value:54,key:6},{value:55,key:7},{value:56,key:8},{value:57,key:9},{value:65,key:"A"},{value:66,key:"B"},{value:67,key:"C"},{value:68,key:"D"},{value:69,key:"E"},{value:70,key:"F"},{value:71,key:"G"},{value:72,key:"H"},{value:73,key:"I"},{value:74,key:"J"},{value:75,key:"K"},{value:76,key:"L"},{value:77,key:"M"},{value:78,key:"N"},{value:79,key:"O"},{value:80,key:"P"},{value:81,key:"Q"},{value:82,key:"R"},{value:83,key:"S"},{value:84,key:"T"},{value:85,key:"U"},{value:86,key:"V"},{value:87,key:"W"},{value:88,key:"X"},{value:89,key:"Y"},{value:90,key:"Z"},{value:91,key:"Left Window"},{value:92,key:"Right Window"},{value:93,key:"Select"},{value:96,key:"Numpad 0"},{value:97,key:"Numpad 1"},{value:98,key:"Numpad 2"},{value:99,key:"Numpad 3"},{value:100,key:"Numpad 4"},{value:101,key:"Numpad 5"},{value:102,key:"Numpad 6"},{value:103,key:"Numpad 7"},{value:104,key:"Numpad 8"},{value:105,key:"Numpad 9"},{value:106,key:"Multiply"},{value:107,key:"Add"},{value:109,key:"Subtract"},{value:110,key:"Decimal point"},{value:111,key:"Divide"},{value:112,key:"F1"},{value:113,key:"F2"},{value:114,key:"F3"},{value:115,key:"F4"},{value:116,key:"F5"},{value:117,key:"F6"},{value:118,key:"F7"},{value:119,key:"F8"},{value:120,key:"F9"},{value:121,key:"F10"},{value:122,key:"F11"},{value:123,key:"F12"},{value:144,key:"Num Lock"},{value:145,key:"Scroll Lock"},{value:173,key:"Audio Mute"},{value:174,key:"Audio Volume Down"},{value:175,key:"Audio Volume Up"},{value:181,key:"Media Player"},{value:182,key:"Launch application 1"},{value:183,key:"Launch application 2"},{value:186,key:"Semi-colon"},{value:187,key:"Equal sign"},{value:188,key:"Comma"},{value:189,key:"Dash"},{value:190,key:"Period"},{value:191,key:"Forward slash"},{value:192,key:"Backquote/Grave accent"},{value:219,key:"Open bracket"},{value:220,key:"Back Slash"},{value:221,key:"Close Bracket"},{value:222,key:"Single Quote"}],m=[{value:0,key:"A"},{value:1,key:"B"},{value:2,key:"X"},{value:3,key:"Y"},{value:4,key:"LB"},{value:5,key:"RB"}];function _(){Input.keyMapper=c}function W(){Input.gamepadMapper=l}function S(){const e=[Input.keyMapper,Input.gamepadMapper],t="WD_ControlsBinder",n=JSON.stringify(e);if(StorageManager.isLocalMode()){const e=require("fs"),i=require("path"),a=i.dirname(process.mainModule.filename),o=i.join(a,"data/"),r=o+t+".json";e.existsSync(o)||e.mkdirSync(o),e.writeFileSync(r,n)}else StorageManager.saveObject(t,e)}function C(e,t){let n,i=[];n=t?0===Object.keys(d).length?h:d:0===Object.keys(k).length?y:k;for(const[t,a]of Object.entries(n))a===e&&i.push(Number(t));return i}function x(e){const t=JSON.stringify(e);return JSON.parse(t)}function I(e,t){if(t){for(const t of g)if(t.value===e)return t.key}else for(const t of m)if(t.value===e)return t.key;return"???"}function b(e){return 0===e||e%2==0}function D(e,t,n){if(n){let n=!1;0===Object.keys(d).length&&(d=x(h));const i=r[Math.floor(t/2)],a=b(t),o=function(e,t){if(t.hasOwnProperty(e)){const n=t[e];return{alreadyExist:!0,value:e,key:n}}return{alreadyExist:!1,value:null,key:null}}(e.value,d),s=O(i,d,a);o.alreadyExist&&null!==s&&(d[s.parameter]=o.key,n=!0),null!==s&&(n||delete d[s.parameter]),d[e.value]=i}else{0===Object.keys(k).length&&(k=x(y));const n=s[t],i=k[e.value],a=O(n,k,!0);k[e.value]=n,k[a.parameter]=i}}function O(e,t,n){let i=0;for(const a in t)if(t[a]===e){if(i++,n&&1===i)return{parameter:a,value:e};if(!n&&2===i)return{parameter:a,value:e}}return null}function B(){switch(v){case 0:return{name:"Xbox Layout",A:"A",X:"X",Y:"Y",B:"B",LB:"LB",RB:"RB"};case 1:return{name:"Playstation Layout",A:"X",X:"□",Y:"△",B:"○",LB:"L1",RB:"R1"};case 2:return{name:"Steam Layout",A:"A",X:"X",Y:"Y",B:"B",LB:"LB",RB:"RB"};case 3:return{name:"Nintendo Layout",A:"B",X:"Y",Y:"X",B:"A",LB:"L",RB:"R"};default:return{name:"Xbox Layout",A:"A",X:"X",Y:"Y",B:"B",LB:"LB",RB:"RB"}}}function H(e){return JSON.parse(e)}!function e(){DataManager.isDatabaseLoaded()&&StorageManager.forageKeysUpdated()?function(){if(StorageManager.isLocalMode())c=$dataWDControlsBinder[0],l=$dataWDControlsBinder[1],_(),W();else{let e=$dataWDControlsBinder;StorageManager.loadObject("WD_ControlsBinder").then(t=>{null!==t&&(e=t),c=e[0],l=e[1],_(),W()}).catch(()=>{c=e[0],l=e[1],_(),W()})}}():requestAnimationFrame(e)}();let R=Scene_Options.prototype.maxCommands;Scene_Options.prototype.maxCommands=function(){return t?8+n:R.call(this)};let L=Scene_Options.prototype.createOptionsWindow;Scene_Options.prototype.createOptionsWindow=function(){L.call(this),this._optionsWindow.setHandler("controlsBinding",this.createInputSelectionWindow.bind(this))},Scene_Options.prototype.createInputSelectionWindow=function(){const e=this.controlsInputWindowsRect();this._wdInputSelectionWindow=new F(e),this._wdInputSelectionWindow.setHandler("ok",this.processSelectionOk.bind(this)),this._wdInputSelectionWindow.setHandler("cancel",this.processSelectionCancel.bind(this)),this.addWindow(this._wdInputSelectionWindow)},Scene_Options.prototype.controlsInputWindowsRect=function(){const e=Graphics.boxWidth,t=.9*Graphics.boxHeight,n=.1*Graphics.boxHeight;return new Rectangle(0,n,e,t)},Scene_Options.prototype.createInputCatcherWindow=function(){const e=this.inputCatcherWindowsRect();this._wdInputCatcherWindow=new T(e),this._wdInputCatcherWindow.setHandler("ok",this.processCatchOk.bind(this)),this._wdInputCatcherWindow.setHandler("cancel",this.processCatchCancel.bind(this)),this.addWindow(this._wdInputCatcherWindow)},Scene_Options.prototype.inputCatcherWindowsRect=function(){const e=Graphics.boxWidth,t=.8*Graphics.boxHeight,n=.2*Graphics.boxHeight;return new Rectangle(0,n,e,t)},Scene_Options.prototype.createInputControllerWindow=function(){const e=this.inputControllerWindowsRect();this._wdInputControllerWindow=new N(e),this._wdInputControllerWindow.setHandler("ok",this.processControllerOk.bind(this)),this._wdInputControllerWindow.setHandler("cancel",this.processControllerCancel.bind(this)),this.addWindow(this._wdInputControllerWindow)},Scene_Options.prototype.inputControllerWindowsRect=function(){const e=.5*Graphics.boxWidth,t=.5*Graphics.boxHeight,n=.25*Graphics.boxWidth,i=.25*Graphics.boxHeight;return new Rectangle(n,i,e,t)},Scene_Options.prototype.processSelectionOk=function(){const e=this._wdInputSelectionWindow._index,t=this,n=this._wdInputSelectionWindow;switch(p){case 0:-1!==e?(n.eraseEverything(),0===e?(p=1,h=x(Input.keyMapper),d={}):(p=2,y=x(Input.gamepadMapper),k={}),n.recreate()):n.activate();break;case 1:if(e<22)n.deactivate(),t.createInputCatcherWindow();else switch(e){case 22:h=w,d={},n.eraseEverything(),n.recreate(),n.activate();break;case 23:t.processSelectionCancel();break;case 24:n.isSaveEnabled()?(0!==Object.keys(d).length?Input.keyMapper=d:Input.keyMapper=h,S(),t.processSelectionCancel()):(n.playBuzzerSound(),n.activate())}break;case 2:0===e?(!function(){const e=v+1;v=e>=4?0:e}(),n.eraseEverything(),n.recreate(),n.activate()):e>0&&e<7?(n.deactivate(),t.createInputControllerWindow()):7===e?(y=f,k={},n.eraseEverything(),n.recreate(),n.activate()):8===e?t.processSelectionCancel():9===e&&(0!==Object.keys(k).length?Input.gamepadMapper=k:Input.gamepadMapper=y,S(),t.processSelectionCancel())}},Scene_Options.prototype.processSelectionCancel=function(){switch(thisWindow=this._wdInputSelectionWindow,thisWindow._index=-1,p){case 0:SceneManager.goto(Scene_Options);break;case 1:case 2:p=0,thisWindow.eraseEverything(),thisWindow.recreate()}},Scene_Options.prototype.processCatchOk=function(){const e=this._wdInputCatcherWindow._index,t=this,n=this._wdInputCatcherWindow;if(-1!==e){D(n._keyDatas[e],t._wdInputSelectionWindow._index,!0),n.destroy(),t._wdInputSelectionWindow.eraseEverything(),t._wdInputSelectionWindow.recreate()}else n.activate()},Scene_Options.prototype.processCatchCancel=function(){this._wdInputCatcherWindow.destroy(),this._wdInputSelectionWindow.activate()},Scene_Options.prototype.processControllerOk=function(){const e=this._wdInputControllerWindow._index,t=this,n=this._wdInputControllerWindow;if(-1!==e){D(n._keyDatas[e],t._wdInputSelectionWindow._index-1,!1),n.destroy(),t._wdInputSelectionWindow.eraseEverything(),t._wdInputSelectionWindow.recreate()}else n.activate()},Scene_Options.prototype.processControllerCancel=function(){this._wdInputControllerWindow.destroy(),this._wdInputSelectionWindow.activate()};let M=Window_Options.prototype.makeCommandList;Window_Options.prototype.makeCommandList=function(){M.call(this),this.addControlsBindingOptions()},Window_Options.prototype.addControlsBindingOptions=function(){this.addCommand(i.optionText,"controlsBinding")};let P=Window_Options.prototype.drawItem;Window_Options.prototype.drawItem=function(e){if(this.commandName(e)===i.optionText){const t=this.commandName(e),n=this.itemLineRect(e),i=n.width;this.resetTextColor(),this.changePaintOpacity(this.isCommandEnabled(e)),this.drawText(t,n.x,n.y,i,"center")}else P.call(this,e)};let E=Window_Options.prototype.processOk;function F(){this.initialize(...arguments)}function T(){this.initialize(...arguments)}function N(){this.initialize(...arguments)}Window_Options.prototype.processOk=function(){const e=this._index;this.commandName(e)===i.optionText?(this.playOkSound(),this.deactivate(),this.callOkHandler()):E.call(this)},Window_Options.prototype.callBindingHandler=function(){this.callHandler("controlsBinding")},F.prototype=Object.create(Window_Selectable.prototype),F.prototype.constructor=F,F.prototype.initialize=function(e){Window_Selectable.prototype.initialize.call(this,e),this._paintData=[],this._textData=[],this.drawCurrentElements()},F.prototype.recreate=function(){this._paintData=[],this._textData=[],this.drawCurrentElements()},F.prototype.maxItems=function(){switch(p){case 0:return 2;case 1:return 25;case 2:return 10}},F.prototype.drawItem=function(e){switch(p){case 0:const t=this._paintData[e].name,n=this.itemRect(e);let a=-1*(this.lineHeight()+8);if(""!==this._paintData[e].picture){let t=new Sprite(ImageManager.loadPicture(this._paintData[e].picture));const i=function(e,t,n){const i=.9*t,a=.9*n;let o=e.width,r=e.height,s=!0,c=!0,l=1;for(;s;)o*l<=i||.1===l?s=!1:l-=.1;for(;c;)r*l<=a||.1===l?c=!1:l-=.1;return Math.floor(10*l)/10}(t,n.width,n.height);t.scale.set(i),t.x=n.x+(this.width/2-t.width*i)/2,t.y=n.y+(n.height-t.height*i)/2,a+=t.y,this.addChild(t),u.push(t)}else a+=n.height/2;this.drawText(t,n.x,a,n.width,"center");break;case 1:const o=this._paintData[e],r=this.mode1Rect(e);this.contents.fontSize=18,o===i.missingKey&&this.changeTextColor("#FF0000"),24!==e||this.isSaveEnabled()||this.changeTextColor("#808080"),this.drawText(o,r.x,r.y-5,r.width,"center"),this.resetFontSettings(),this.resetTextColor();break;case 2:const s=this._paintData[e],c=B(),l=e>0&&e<7?c[s]:s,h=this.mode2Rect(e),d=e>0&&e<7?0:10;this.drawText(l,h.x,h.y+d,h.width,"center"),this.resetFontSettings()}},F.prototype.mode1Rect=function(e){const t=this;let n=0,i=0,a=0,o=0;if(e<22){const r=Math.floor(e/2);a=.28*t.innerWidth,o=.05*t.innerHeight,i=.05*t.innerHeight+.07*t.innerHeight*r,n=b(e)?.36*t.innerWidth:.68*t.innerWidth}else 22===e?(a=.36*t.innerWidth,o=.05*t.innerHeight,i=.85*t.innerHeight,n=.32*t.innerWidth):(a=.32*t.innerWidth,o=.05*t.innerHeight,i=.92*t.innerHeight,n=23===e?.04*t.innerWidth:.64*t.innerWidth);return new Rectangle(n,i,a,o)},F.prototype.mode2Rect=function(e){const t=this;let n=0,i=0,a=0,o=0;if(e>0&&e<7){const r=Math.floor((e-1)/2);a=.15*t.innerWidth,o=.08*t.innerHeight,i=.28*t.innerHeight+.12*t.innerHeight*r,n=b(e)?.55*t.innerWidth:.3*t.innerWidth}else 0===e?(a=.6*t.innerWidth,o=.12*t.innerHeight,i=.08*t.innerHeight,n=.2*t.innerWidth):7===e?(a=.6*t.innerWidth,o=.12*t.innerHeight,i=.64*t.innerHeight,n=.2*t.innerWidth):(a=.3*t.innerWidth,o=.12*t.innerHeight,i=.84*t.innerHeight,n=b(e)?.1*t.innerWidth:.6*t.innerWidth);return new Rectangle(n,i,a,o)},F.prototype.textRect=function(e,t){const n=this;let i=0,a=0,o=0,r=0;if(t)o=.28*n.innerWidth,r=.05*n.innerHeight,a=.05*n.innerHeight+.07*n.innerHeight*e,i=.04*n.innerWidth;else{const t=Math.floor(e/2),s=b(e);o=.2*n.innerWidth,r=.08*n.innerHeight,a=.28*n.innerHeight+.12*n.innerHeight*t,i=s?.1*n.innerWidth:.7*n.innerWidth}return new Rectangle(i,a,o,r)},F.prototype.itemRect=function(e){const t=this;if(0===p){const t=this.maxCols(),n=this.itemWidth(),i=this.itemHeight(),a=this.colSpacing(),o=this.rowSpacing(),r=e%t,s=Math.floor(e/t),c=r*n+a/2-this.scrollBaseX(),l=s*i+o/2-this.scrollBaseY();return new Rectangle(c,l,n-a,i-o)}return 1===p?t.mode1Rect(e):t.mode2Rect(e)},F.prototype.maxCols=function(){return 2},F.prototype.drawCurrentElements=function(){this._paintData=[],this._textData=[];const e=this;switch(p){case 0:this._paintData=[{name:a.keyboard,picture:o.keyPicPath},{name:a.controller,picture:o.conPicPath}];break;case 1:for(const t of r){const n={name:"",valueInput1:"",valueInput2:""},o=C(t,!0);n.name=a[t],0===o.length?n.valueInput1=i.missingKey:n.valueInput1=I(o[0],!0),o.length>=2?n.valueInput2=I(o[1],!0):n.valueInput2="",e._textData.push(n.name),e._paintData.push(n.valueInput1),e._paintData.push(n.valueInput2)}e._paintData.push(i.reset),e._paintData.push(i.undo),e._paintData.push(i.save);break;case 2:const t=B();e._paintData.push(t.name);for(const t of s){const n={name:"",valueInput1:""},i=C(t,!1);if(0===i.length)throw new Error("WD_ControlsBinder: There are no binded controls to value: "+t);n.name=a[t],n.valueInput1=I(i[0],!1),e._textData.push(n.name),e._paintData.push(n.valueInput1)}e._paintData.push(i.reset),e._paintData.push(i.undo),e._paintData.push(i.save)}var t;0!==p||""===this._paintData[0].picture&&""===this._paintData[1].picture?(t=.05,new Promise(function(e,n){setTimeout(function(){e()},1e3*t)})).then(function(){e.paint(),e.showText(),e._index=0,e.activate()}).catch(function(e){console.warn("WD_ControlsBinder: Error in the timing function")}):this.preLoadGraphic()},F.prototype.showText=function(){const e=this;switch(p){case 0:break;case 1:for(let t=0;t<e._textData.length;t++){const n=this.textRect(t,!0),i=e._textData[t];this.contents.fontSize=18,this.drawText(i,n.x,n.y-5,n.width,"center"),this.resetFontSettings()}break;case 2:for(let t=0;t<e._textData.length;t++){const n=this.textRect(t,!1),i=e._textData[t];this.drawText(i,n.x,n.y,n.width,"center"),this.resetFontSettings()}}},F.prototype.preLoadGraphic=function(){if(""!==this._paintData[0].picture){ImageManager.loadPicture(this._paintData[0].picture).addLoadListener(function(){this.preLoadGraphic2()}.bind(this))}else this.preLoadGraphic2()},F.prototype.preLoadGraphic2=function(){if(""!==this._paintData[1].picture){ImageManager.loadPicture(this._paintData[1].picture).addLoadListener(function(){this.launchPaint()}.bind(this))}else this.paint(),this._index=0,this.activate()},F.prototype.launchPaint=function(){this.paint(),this.activate()},F.prototype.itemHeight=function(){switch(p){case 0:return.9*this.innerHeight;case 1:case 2:return Window_Scrollable.prototype.itemHeight.call(this)+8}},F.prototype.removeSprites=function(){if(u.length>0)for(const e of u)this.removeChild(e);u=[]},F.prototype.eraseEverything=function(){this.contents&&(this.contents.clear(),this.contentsBack.clear()),this.removeSprites()},F.prototype.isSaveEnabled=function(){if(1===p){let e=!0;for(const t of this._paintData)t===i.missingKey&&(e=!1);return e}return!0},T.prototype=Object.create(Window_Selectable.prototype),T.prototype.constructor=T,T.prototype.initialize=function(e){Window_Selectable.prototype.initialize.call(this,e),this._keyDatas=x(g),this.refresh(),this._index=0,this.activate()},T.prototype.maxItems=function(){return 109},T.prototype.maxCols=function(){return 3},T.prototype.drawItem=function(e){const t=this.itemRect(e),n=this._keyDatas[e].key;this.drawText(n,t.x,t.y,t.width,"center")},N.prototype=Object.create(Window_Selectable.prototype),N.prototype.constructor=N,N.prototype.initialize=function(e){Window_Selectable.prototype.initialize.call(this,e),this._keyDatas=x(m),this.refresh(),this._index=0,this.activate()},N.prototype.maxItems=function(){return 6},N.prototype.maxCols=function(){return 2},N.prototype.drawItem=function(e){const t=B(),n=this.itemRect(e),i=t[this._keyDatas[e].key];this.drawText(i,n.x,n.y,n.width,"center")}}();