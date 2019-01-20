"use strict";var _createClass=function(){function r(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(t,e,n){return e&&r(t.prototype,e),n&&r(t,n),t}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _defineProperty(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}!function(t,e){"undefined"!=typeof module&&"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=e():"function"==typeof define&&(define.amd||define.cmd)?define(function(){return e}):t.Assembly=e()}("undefined"!=typeof window?window:global,function(){var e=function(){function t(){_classCallCheck(this,t)}return _createClass(t,null,[{key:"getArgsLength",value:function(t){for(var e=t.toString(),n=0,r=0,o=0,i=!1,s=!1,a=0;a<e.length;a++)if(!["(","[","{"].includes(e[a])||i||s){if(![")","]","}"].includes(e[a])||i||s)"'"!==e[a]||s||"\\"===e[a-1]?'"'!==e[a]||i||"\\"===e[a-1]?","!==e[a]||1!==r||i||s||n++:s=!s:i=!i;else if(--r<1)break}else r++,o=a;return 0===n&&0===e.substring(o+1,a).trim().length?0:n+1}}]),t}(),s=function(){function e(t){_classCallCheck(this,e),this.$moduleBase={name:t||"no name"}}return _createClass(e,[{key:"$systemError",value:function(t,e){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:"$_no_error";throw"$_no_error"!==n&&(console.log("%c error : ","color:#FFF; background:red"),console.log(n)),new Error("(☉д⊙)!! Assembly::"+this.$moduleBase.name+" => "+t+" -> "+e)}},{key:"$noKey",value:function(t,e,n){return null==e[n]||(this.$systemError(t,"Name already exists.",n),!1)}},{key:"$verify",value:function(t,e){var n=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{},r={};for(var o in e){var i=e[o];if(i[0]&&null==t[o])return void this.$systemError("verify","Must required",o);null!=t[o]?_typeof(i[1])!==("string"==typeof t[o]&&"#"===t[o][0])||t[o].slice(1)?r[o]=t[o]:this.$systemError("verify","Type("+_typeof(i[1])+") error",o):r[o]=i[1]}return Object.assign(r,n)}}]),e}(),i=function t(){_classCallCheck(this,t)},t=function(t){function e(){_classCallCheck(this,e);var t=_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"Assembly"));return t.groups={},t.bridge=null,t}return _inherits(e,s),_createClass(e,[{key:"getGroup",value:function(t){if(this.hasGroup(t))return this.groups[t];this.$systemError("getGroup","Group not found.")}},{key:"getTool",value:function(t,e){return this.getGroup(t).getTool(e)}},{key:"getLine",value:function(t,e){return this.getGroup(t).getLine(e)}},{key:"addGroup",value:function(t,e,n){null==this.groups[t]?e instanceof u!=!1?"alone"!==e.mode?(e.create&&e.create(n),this.groups[t]=e):this.$systemError("addGroup","Group is alone.",e):this.$systemError("addGroup","Must group.",e):this.$systemError("addGroup","Name already exists.",t)}},{key:"hasGroup",value:function(t){return!!this.groups[t]}},{key:"hasTool",value:function(t,e){return!!this.getGroup(t).hasTool(e)}},{key:"hasLine",value:function(t,e){return!!this.getGroup(t).hasLine(e)}},{key:"tool",value:function(t,e){return this.callBridge(t,e),this.getTool(t,e).use()}},{key:"line",value:function(t,e){return this.callBridge(t,e),this.getLine(t,e).use()}},{key:"callBridge",value:function(t,e){this.bridge&&this.bridge(this,t,e)}},{key:"setBridge",value:function(t){"function"==typeof t?this.bridge=t:this.$systemError("setBridge","Bridge not a function.",t)}}]),e}(),o=function(t){function o(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=arguments[1],n=arguments[2];_classCallCheck(this,o);var r=_possibleConstructorReturn(this,(o.__proto__||Object.getPrototypeOf(o)).call(this,"Tool"));return r.user=n||new i,r.store={},r.group=e,r.argumentLength="number"==typeof t.paramLength?t.paramLength:-1,r.data=r.$verify(t,{name:[!0,""],create:[!1,function(){}],action:[!0,"#function"],allowDirect:[!1,!0]}),r}return _inherits(o,s),_createClass(o,[{key:"install",value:function(){this.initSystem(),this.initArgLength(),this.install=null,this.data.create.bind(this.user)(this.store,{group:this.group.case,include:this.include.bind(this)})}},{key:"initSystem",value:function(){this.system={coop:this.coop.bind(this),store:this.store,group:this.group.case,include:this.include.bind(this)}}},{key:"initArgLength",value:function(){-1===this.argumentLength&&(this.argumentLength=e.getArgsLength(this.data.action)-3),this.argumentLength<0&&this.$systemError("initArgLength","Args length < 0",this.name+"(length:"+this.argumentLength+")")}},{key:"createExports",value:function(){var t={noGood:null,package:[]},e={store:this.getStore.bind(this),direct:this.createLambda(this.direct,"direct",t),action:this.createLambda(this.action,"action",t),promise:this.createLambda(this.promise,"promise",t)},n=this.createSupport(e,t);return Object.assign(e,n)}},{key:"createSupport",value:function(e,n){return{ng:function(t){if("function"==typeof t)return n.noGood=t,e;this.$systemError("createSupport","NG param not a function.",t)},packing:function(){return n.package=n.package.concat([].concat(Array.prototype.slice.call(arguments))),e},unPacking:function(){return n.package=[],e}}}},{key:"getError",value:function(t){return t||"unknown error"}},{key:"createLambda",value:function(o,i,s){var a=this,t=Symbol(this.group.data.alias+"_"+this.name+"_"+i);return _defineProperty({},t,function(){var t=s.package.concat([].concat(Array.prototype.slice.call(arguments))),e=null;"action"===i&&("function"==typeof t.slice(-1)[0]?e=t.pop():a.$systemError("createLambda","Action must a callback, no need ? try direct!"));for(var n=new Array(a.argumentLength),r=0;r<n.length;r++)n[r]=t[r]||void 0;return o.bind(a)(n,e,s)})[t]}},{key:"include",value:function(t){return this.group.getTool(t).use()}},{key:"coop",value:function(t){return this.group.getMerger(t)}},{key:"call",value:function(t,e,n){var r;(r=this.data.action).call.apply(r,[this.user].concat(_toConsumableArray(t),[this.system,e,n]))}},{key:"createResponse",value:function(t){var e=t.error,n=t.success,r=!1;return{error:function(t){r||(r=!0,e(t))},success:function(t){r||(r=!0,n(t))}}}},{key:"direct",value:function(t,e,n){var r=this;!1===this.data.allowDirect&&this.$systemError("direct","Not allow direct.",this.data.name);var o=null,i=this.createResponse({error:function(t){if(!n.noGood)throw new Error(r.getError(t));n.noGood(r.getError(t))},success:function(t){o=t}});return this.call(t,i.error,i.success),o}},{key:"action",value:function(t){var n=this,r=1<arguments.length&&void 0!==arguments[1]?arguments[1]:function(){},o=arguments[2],e=this.createResponse({error:function(t){var e=n.getError(t);o.noGood?o.noGood(e):r(e,null)},success:function(t){o.noGood?r(t):r(null,t)}});this.call(t,e.error,e.success)}},{key:"promise",value:function(r,t,o){var i=this;return new Promise(function(e,n){var t=i.createResponse({error:function(t){var e=i.getError(t);o.noGood&&o.noGood(e),n(e)},success:function(t){e(t)}});i.call(r,t.error,t.success)})}},{key:"getStore",value:function(t){if(this.store[t])return this.store[t];this.$systemError("getStore","Key not found.",t)}},{key:"use",value:function(){return this.install&&this.install(),this.createExports()}},{key:"name",get:function(){return this.data.name}}]),o}(),r=function(t){function r(t,e){_classCallCheck(this,r);var n=_possibleConstructorReturn(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,"Line"));return n.group=e,n.data=n.$verify(t,{name:[!0,""],fail:[!0,"#function"],inlet:[!1,[]],input:[!0,"#function"],output:[!0,"#function"],layout:[!0,{}]}),n.inlet=n.data.inlet||null,n.tools={},n.checkPrivateKey(),n}return _inherits(r,s),_createClass(r,[{key:"checkPrivateKey",value:function(){var t=this.data.layout;(t.action||t.promise)&&this.$systemError("init","Layout has private key(action, promise)")}},{key:"use",value:function(){var t=this;return function(){return new n(t,[].concat(Array.prototype.slice.call(arguments))).getConveyer()}}},{key:"name",get:function(){return this.data.name}}]),r}(),n=function(t){function r(t,e){_classCallCheck(this,r);var n=_possibleConstructorReturn(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,"Unit"));return n.case=new i,n.flow=[],n.main=t,n.stack=[],n.index=0,n.layout=t.data.layout,n.params=e,n.previousFlow=null,n.init(),n}return _inherits(r,s),_createClass(r,[{key:"createTool",value:function(t,e){return new o({name:t,action:e},this.main.group,this.case)}},{key:"init",value:function(){this.input=this.createTool("input",this.main.data.input).use(),this.output=this.createTool("output",this.main.data.output).use(),this.initConveyer()}},{key:"initConveyer",value:function(){var e=this,n=this;this.conveyer={action:this.action.bind(this),promise:this.promise.bind(this)};var t=function(t){e.conveyer[t]=function(){return n.register(t,[].concat(Array.prototype.slice.call(arguments))),n.getConveyer()}};for(var r in this.layout)t(r)}},{key:"getConveyer",value:function(){return this.conveyer}},{key:"register",value:function(t,e){0!==this.main.inlet.length&&0===this.flow.length&&(this.main.inlet.includes(t)||this.$systemError("register","First call method not inside inlet.",t));var n={name:t,index:this.index,method:this.createTool(t,this.layout[t]).use(),params:e,nextFlow:null,previous:this.flow.slice(-1)};this.previousFlow&&(this.previousFlow.nextFlow=n),this.previousFlow=n,this.index+=1,this.flow.push(n)}},{key:"include",value:function(t){return this.main.group.getTool(t).use()}},{key:"action",value:function(e){var n=this;this.process(function(t){n.main.data.fail(t,function(t){e(t,null)})},function(t){e(null,t)})}},{key:"promise",value:function(){var t=this;return new Promise(function(n,r){t.action(function(t,e){t?r(t):n(e)})})}},{key:"process",value:function(t,e){new a(this.params,this.flow,this.input,this.output).start(t,e)}}]),r}(),a=function(t){function i(t,e,n,r){_classCallCheck(this,i);var o=_possibleConstructorReturn(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,"Process"));return o.material=t,o.stop=!1,o.flow=e,o.index=0,o.stack=[],o.input=n,o.output=r,o}return _inherits(i,s),_createClass(i,[{key:"start",value:function(t,e){var n,r=this;this.error=t,this.success=e,this.stack.push("input"),(n=this.input).action.apply(n,_toConsumableArray(this.material).concat([function(t){t?r.fail(t):r.next()}]))}},{key:"finish",value:function(){var n=this;this.stack.push("output"),this.output.action(function(t,e){t?n.fail(t):n.success(e)})}},{key:"createError",value:function(t){return{message:t||"unknown error",stack:this.stack}}},{key:"fail",value:function(t){!1===this.stop&&(this.stop=!0,this.error(this.createError(t)))}},{key:"next",value:function(){var t,e=this,n=this.flow[this.index];n&&!1===this.stop?(this.stack.push(n.name),(t=n.method).action.apply(t,_toConsumableArray(n.params).concat([function(t){t?e.fail(t):(e.index+=1,e.next())}]))):!1===this.stop&&this.finish()}}]),i}(),u=function(t){function n(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};_classCallCheck(this,n);var e=_possibleConstructorReturn(this,(n.__proto__||Object.getPrototypeOf(n)).call(this,"Group"));return e.case=new i,e.line={},e.mode="factory",e.toolbox={},e.data=e.$verify(t,{alias:[!1,"no_alias_group"],merger:[!1,{}],create:[!1,function(){}]}),e.initMerger(),e}return _inherits(n,s),_createClass(n,[{key:"initMerger",value:function(){for(var t in this.data.merger){var e=this.data.merger[t];e.tool&&e.line||this.$systemError("initMerger","Group not alone group.",e)}}},{key:"alone",value:function(t){if("alone"!==this.mode)return this.mode="alone",this.create(t),{tool:this.callTool.bind(this),line:this.callLine.bind(this)};this.$systemError("alone","Alone only use once, try function() { return new Group() }.")}},{key:"create",value:function(t){this.data.create.bind(this.case)(t),this.create=null}},{key:"getTool",value:function(t){if(this.toolbox[t])return this.toolbox[t];this.$systemError("getTool","Tool not found.",t)}},{key:"getLine",value:function(t){if(this.line[t])return this.line[t];this.$systemError("getLine","Line not found.",t)}},{key:"getMerger",value:function(t){if(this.data.merger[t])return this.data.merger[t];this.$systemError("getMerger","Merger not found.",t)}},{key:"callTool",value:function(t){return this.getTool(t).use()}},{key:"callLine",value:function(t){1<arguments.length&&void 0!==arguments[1]&&arguments[1];return this.getLine(t).use()}},{key:"addLine",value:function(t){var e=new r(t,this);this.$noKey("currying",this.line,e.name)&&(this.line[e.name]=e)}},{key:"addTool",value:function(t){var e=new o(t,this);this.$noKey("addTool",this.toolbox,e.name)&&(this.toolbox[e.name]=e)}},{key:"hasLine",value:function(t){return!!this.line[t]}},{key:"hasTool",value:function(t){return!!this.toolbox[t]}}]),n}(),c=t;return c.Group=u,c});