

    (function( root, factory ){
    
        let moduleName = 'Assembly';
    
        if( typeof module !== 'undefined' && typeof exports === 'object' ) {
            module.exports = factory();
        }
        else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
            define(function() { return factory; });
        } 
        else {
            root[moduleName] = factory();
        }
    
    })( this || (typeof window !== 'undefined' ? window : global), function(){
        class Functions {

    static getArgsLength(func) {
        var funcStr = func.toString()
        var commaCount = 0
        var bracketCount = 0
        var lastParen = 0
        var inStrSingle = false
        var inStrDouble = false
        for (var i = 0; i < funcStr.length; i++) {
            if (['(', '[', '{'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount++
                lastParen = i
            } else if ([')', ']', '}'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount--
                if (bracketCount < 1) {
                    break;
                }
            } else if (funcStr[i] === "'" && !inStrDouble && funcStr[i - 1] !== '\\') {
                inStrSingle = !inStrSingle
            } else if (funcStr[i] === '"' && !inStrSingle && funcStr[i - 1] !== '\\') {
                inStrDouble = !inStrDouble
            } else if (funcStr[i] === ',' && bracketCount === 1 && !inStrSingle && !inStrDouble) {
                commaCount++
            }
        }
        if (commaCount === 0 && funcStr.substring(lastParen + 1, i).trim().length === 0) {
            return 0;
        }
        return commaCount + 1
    }

}
/**
 * @class ModuleBase()
 * @desc 系統殼層
 */

class ModuleBase {

    constructor(name){
        this.$moduleBase = { 
            name: name || 'no name'
        };
    }

    /**
     * @function $systemError(functionName,maessage,object)
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $systemError( functionName, message, object = '$_no_error' ){
        if( object !== '$_no_error' ){
            console.log( `%c error : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! Assembly::${this.$moduleBase.name} => ${functionName} -> ${message}` );
    }

    $noKey( functionName, target, key ) {
        if( target[key] == null ){
            return true;
        } else {
            this.$systemError( functionName, 'Name already exists.', key );
            return false;
        } 
    }

    $verify(data, validate, assign = {}) {
        let newData = {}
        for( let key in validate ){
            let v = validate[key];
            if( v[0] && data[key] == null ){
                this.$systemError('verify', 'Must required', key);
                return;
            }
            if( data[key] != null ){
                if( typeof v[1] === (typeof data[key] === 'string' && data[key][0] === "#") ? data[key].slice(1) : 'string' ){
                    newData[key] = data[key];
                } else {
                    this.$systemError('verify', `Type(${typeof v[1]}) error`, key);
                }
            } else {
                newData[key] = v[1];
            }
        }
        return Object.assign(newData, assign);
    }

}

class Case {}

/**
 * @class Assembly()
 * @desc 主核心
 */

class Assembly extends ModuleBase {

    /**
     * @member {object} groups group的集結包
     * @member {function} bridge 每次請求時的一個呼叫函數
     */

    constructor() {
        super("Assembly")
        this.groups = {}
        this.bridge = null
    }

    /**
     * @function getGroup(name)
     * @desc 獲取一個Group
     */

    getGroup(name) {
        if (this.hasGroup(name)) {
            return this.groups[name]
        } else {
            this.$systemError('getGroup', 'Group not found.')
        }
    }

    /**
     * @function getTool(groupName,name)
     * @desc 獲取一個Tool
     */

    getTool(groupName, name) {
        return this.getGroup(groupName).getTool(name)
    }

    /**
     * @function getLine(groupName,name)
     * @desc 獲取一個Curried Function
     */

    getLine(groupName, name) {
        return this.getGroup(groupName).getLine(name)
    }

    /**
     * @function addGroup(name,group,options)
     * @desc 加入一個Group
     * @param {object} options group被初始化時能夠接收到的外部物件
     */

    addGroup(name, group, options) {
        if (this.groups[name] != null){
            this.$systemError('addGroup', 'Name already exists.', name)
            return
        }
        if ((group instanceof Group) === false) {
            this.$systemError('addGroup', 'Must group.', group)
            return
        }
        if (group.mode === 'alone') {
            this.$systemError('addGroup', 'Group is alone.', group)
            return
        }
        if (group.create) {
            group.create(options)
        }
        this.groups[name] = group
    }

    /**
     * @function hasGroup(name)
     * @desc 加入一個Group
     */

    hasGroup(name) {
        return !!this.groups[name]
    }

    /**
     * @function hasTool(groupName,name)
     * @desc 有無註冊過Tool
     */

    hasTool(groupName, name) {
        return !!this.getGroup(groupName).hasTool(name)
    }

    /**
     * @function hasLine(groupName,name)
     * @desc 有無柯理化的function
     */

    hasLine(groupName, name) {
        return !!this.getGroup(groupName).hasLine(name)
    }

    /**
     * @function tool(groupName,name)
     * @desc 呼叫一個tool，當然...它仍是一個具有action, promise等功能的物件
     */

    tool(groupName, name) {
        this.callBridge(groupName, name)
        return this.getTool(groupName, name).use()
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        this.callBridge(groupName, name)
        return this.getLine(groupName, name).use()
    }

    /**
     * @function callBridge
     * @desc 呼叫橋接器
     */

    callBridge(groupName, name) {
        if (this.bridge) {
            this.bridge(this, groupName, name)
        }
    }

    /**
     * @function setBridge
     * @desc 建立橋接器，在任何呼叫前執行一個function
     * @param {function} bridge 
     */

    setBridge(bridge) {
        if (typeof bridge === 'function') {
            this.bridge = bridge
        } else {
            this.$systemError('setBridge', 'Bridge not a function.', bridge)
        }
    }

}

/**
 * @class Tool
 * @desc Assembly的最小單位，負責執行指定邏輯
 */

/**
 * @argument options
 * @member {string}   name 模具名稱
 * @member {number}   paramLength 參數長度
 * @member {boolean}  allowDirect 是否允許直接回傳
 * @member {function} create 首次使用該模具時呼叫
 * @member {function} action 主要執行的function
 */

class Tool extends ModuleBase {

    /**
     * @member {Case} user this指向的位置，Case是一個空物件
     * @member {object} store 對外暴露的物件
     */

    constructor(options = {}, group, user) {
        super('Tool')
        this.user = user || new Case()
        this.store = {}
        this.group = group
        this.argumentLength = typeof options.paramLength === 'number' ? options.paramLength : -1
        this.data = this.$verify(options, {
            name: [true, ''],
            create: [false, function () {}],
            action: [true, '#function'],
            allowDirect: [false, true]
        })
    }

    get name() { return this.data.name }

    /**
     * @function install()
     * @desc 當模具被第一次使用時呼叫
     */

    install() {
        this.initSystem()
        this.initArgLength()
        this.install = null
        this.data.create.bind(this.user)(this.store, {
            group: this.group.case,
            include: this.include.bind(this)
        })
    }

    /**
     * @function initSystem()
     * @desc 初始化接口
     */

    initSystem() {
        this.system = {
            coop: this.coop.bind(this),
            store: this.store,
            group: this.group.case,
            include: this.include.bind(this)
        }
    }

    initArgLength() {
        if (this.argumentLength === -1) {
            this.argumentLength = Functions.getArgsLength(this.data.action) - 3
        }
        if (this.argumentLength < 0) {
            this.$systemError('initArgLength', 'Args length < 0', this.name + `(length:${this.argumentLength})`)
        }
    }

    createExports() {
        let supData = {
            noGood: null,
            package: []
        }
        let exps = {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct, 'direct', supData),
            action: this.createLambda(this.action, 'action', supData),
            promise: this.createLambda(this.promise, 'promise', supData)
        }
        let supports = this.createSupport(exps, supData)
        return Object.assign(exps, supports)
    }

    createSupport(exps, supData) {
        return {
            ng: function(broadcast) {
                if (typeof broadcast === 'function') {
                    supData.noGood = broadcast
                    return exps
                }
                this.$systemError('createSupport', 'NG param not a function.', broadcast)
            },
            packing: function() {
                supData.package = supData.package.concat([...arguments])
                return exps
            },
            unPacking: function() {
                supData.package = []
                return exps
            }
        }
    }

    getError(message) {
        return message || 'unknown error'
    }

    createLambda(func, type, supports) {
        let self = this
        let name = Symbol(this.group.data.alias + '_' + this.name + '_' + type)
        let tool = {
            [name]: function() {
                let params = supports.package.concat([...arguments])
                let callback = null
                if (type === 'action') {
                    if (typeof params.slice(-1)[0] === 'function') {
                        callback = params.pop()
                    } else {
                        self.$systemError('createLambda', 'Action must a callback, no need ? try direct!')
                    }
                }
                let args = new Array(self.argumentLength)
                for (let i = 0; i < args.length; i++) {
                    args[i] = params[i] || undefined
                }
                return func.bind(self)(args, callback, supports)
            }
        }
        return tool[name]
    }

    include(name) {
        return this.group.getTool(name).use()
    }

    coop(name) {
        return this.group.getMerger(name)
    }

    call(params, error, success) {
        this.data.action.call(this.user, ...params, this.system, error, success)
    }

    createResponse({ error, success }) {
        let over = false
        return {
            error: (err) => {
                if (over) return
                over = true
                error(err)
            },
            success: (result) => {
                if (over) return
                over = true
                success(result)
            }
        }
    }

    direct(params, callback, supports) {
        if (this.data.allowDirect === false) {
            this.$systemError('direct', 'Not allow direct.', this.data.name)
        }
        let output = null
        let response = this.createResponse({
            error: (err) => {
                if (supports.noGood) {
                    supports.noGood(this.getError(err))
                } else {
                    throw new Error(this.getError(err))
                }
            },
            success: (result) => {
                output = result
            }
        })
        this.call(params, response.error, response.success)
        return output
    }

    action(params, callback = function () { }, supports) {
        let response = this.createResponse({
            error: (err) => {
                let message = this.getError(err)
                if (supports.noGood) {
                    supports.noGood(message)
                } else {
                    callback(message, null)
                }
            },
            success: (result) => {
                if (supports.noGood) {
                    callback(result)
                } else {
                    callback(null, result)
                }
            }
        })
        this.call(params, response.error, response.success)
    }

    promise(params, callback, supports) {
        return new Promise((resolve, reject) => {
            let response = this.createResponse({
                error: (err) => {
                    let message = this.getError(err)
                    if (supports.noGood) {
                        supports.noGood(message)
                    }
                    reject(message)
                },
                success: (result) => {
                    resolve(result)
                }
            })
            this.call(params, response.error, response.success)
        })
    }

    getStore(key) {
        if (this.store[key]) {
            return this.store[key]
        } else {
            this.$systemError('getStore', 'Key not found.', key)
        }
    }

    use() {
        if (this.install) { this.install() }
        return this.createExports()
    }

}

class Line extends ModuleBase {

    constructor(options, group) {
        super("Line");
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            fail: [true, '#function'],
            inlet: [false, []],
            input: [true, '#function'],
            output: [true, '#function'],
            layout: [true, {}]
        })
        this.inlet = this.data.inlet || null
        this.tools = {}
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    checkPrivateKey() {
        let layout = this.data.layout
        if( layout.action || layout.promise ){
            this.$systemError('init', 'Layout has private key(action, promise)')
        }
    }

    use() {
        let self = this
        return function() {
            let unit = new Deploy(self, [...arguments])
            return unit.getConveyer()
        }
    }

}

class Deploy extends ModuleBase {

    constructor(main, params) {
        super("Unit")
        this.case = new Case()
        this.flow = []
        this.main = main
        this.stack = []
        this.index = 0
        this.layout = main.data.layout
        this.params = params
        this.previousFlow = null
        this.init()
    }

    createTool(name, action) {
        return new Tool({ name, action }, this.main.group, this.case)
    }

    init() {
        this.input = this.createTool('input', this.main.data.input).use()
        this.output = this.createTool('output', this.main.data.output).use()
        this.initConveyer()
    }

    initConveyer() {
        let self = this;
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for (let name in this.layout) {
            this.conveyer[name] = function() {
                self.register(name, [...arguments])
                return self.getConveyer()
            }
        }
    }

    getConveyer() {
        return this.conveyer
    }

    register(name, params) {
        if (this.main.inlet.length !== 0 && this.flow.length === 0) {
            if (!this.main.inlet.includes(name)) {
                this.$systemError('register', 'First call method not inside inlet.', name)
            }
        }
        let data = {
            name: name,
            index: this.index,
            method: this.createTool(name, this.layout[name]).use(),
            params: params,
            nextFlow: null,
            previous: this.flow.slice(-1)
        }
        if( this.previousFlow ){
            this.previousFlow.nextFlow = data
        }
        this.previousFlow = data
        this.index += 1
        this.flow.push(data)
    }

    include(name) {
        return this.main.group.getTool(name).use()
    }

    action(callback) {
        let error = (error) => {
            this.main.data.fail(error, (report) => {
                callback(report, null)
            })
        }
        let success = (success) => {
            callback(null, success)
        }
        this.process(error, success)
    }

    promise() {
        return new Promise(( resolve, reject )=>{
            this.action((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    process(error, success) {
        let rightNow = new Process(this.params, this.flow, this.input, this.output)
        rightNow.start(error, success)
    }

}

class Process extends ModuleBase {

    constructor(material, flow, input, output) {
        super('Process')
        this.material = material
        this.stop = false
        this.flow = flow
        this.index = 0
        this.stack = []
        this.input = input
        this.output = output
    }

    start(error, success) {
        this.error = error
        this.success = success
        this.stack.push('input')
        this.input.action(...this.material, (err) => {
            if (err) {
                this.fail(err)
            } else {
                this.next()
            }
        })
    }

    finish() {
        this.stack.push('output')
        this.output.action((err, result) => {
            if (err) {
                this.fail(err)
            } else {
                this.success(result)
            }
        })
    }

    createError(message) {
        return {
            message: message || 'unknown error',
            stack: this.stack
        }
    }

    fail(message) {
        if (this.stop === false) {
            this.stop = true
            this.error(this.createError(message))
        }
    }

    next() {
        let flow = this.flow[this.index]
        if (flow && this.stop === false) {
            this.stack.push(flow.name)
            flow.method.action(...flow.params, (err) => {
                if (err) {
                    this.fail(err)
                } else {
                    this.index += 1
                    this.next()
                }
            })
        } else if (this.stop === false) {
            this.finish()
        }
    }

}
class Group extends ModuleBase {

    constructor(options = {}) {
        super("Group")
        this.case = new Case()
        this.line = {}
        this.mode = 'factory'
        this.toolbox = {}
        this.data = this.$verify(options, {
            alias: [false, 'no_alias_group'],
            merger: [false, {}],
            create: [false, function(){}]
        })
        this.initMerger()
    }

    initMerger() {
        for (let key in this.data.merger) {
            let alone = this.data.merger[key]
            if (!alone.tool || !alone.line) {
                this.$systemError('initMerger', 'Group not alone group.', alone)
            }
        }
    }

    alone(options) {
        if (this.mode === 'alone') {
            this.$systemError('alone', 'Alone only use once, try function() { return new Group() }.')
        } else {
            this.mode = 'alone'
            this.create(options)
            return {
                tool: this.callTool.bind(this),
                line: this.callLine.bind(this)
            }
        }
    }

    create(options) {
        this.data.create.bind(this.case)(options)
        this.create = null
    }

    getTool(name) {
        if( this.toolbox[name] ){
            return this.toolbox[name]
        } else {
            this.$systemError('getTool', 'Tool not found.', name)
        }
    }

    getLine(name) {
        if( this.line[name] ){
            return this.line[name]
        } else {
            this.$systemError('getLine', 'Line not found.', name)
        }
    }

    getMerger(name) {
        if (this.data.merger[name]) {
            return this.data.merger[name]
        } else {
            this.$systemError('getMerger', 'Merger not found.', name)
        }
    }

    callTool(name) {
        return this.getTool(name).use()
    }

    callLine(name, group = this) {
        return this.getLine(name).use()
    }

    /**
     * @function addLine(options)
     * @desc 加入一個產線
     */

    addLine(options){
        let curry = new Line(options, this)
        if( this.$noKey('currying', this.line, curry.name ) ){
            this.line[curry.name] = curry
        }
    }

    /**
     * @function addTool(options)
     * @desc 加入一個工具
     * @param {object} options 建立tool所需要的物件
     */

    addTool(options) {
        let tool = new Tool(options, this)
        if( this.$noKey('addTool', this.toolbox, tool.name ) ){
            this.toolbox[tool.name] = tool
        }
    }

    hasLine(name) {
        return !!this.line[name]
    }

    hasTool(name) {
        return !!this.toolbox[name]
    }

}

            let __re = Assembly;
            __re.Group = Group;

            return __re;
        
    })
