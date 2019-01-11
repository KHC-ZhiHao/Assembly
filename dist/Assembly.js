

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

    $protection(object, key, getter, value) {
        getter[key] = value
        Object.defineProperty( object, key, {
            set: ()=>{
                this.$systemError('protection', "This key is a private key, can't be change.", key );
            },
            get: ()=>{
                return getter[key]
            },
        })
    }

}

class Case {}
/**
 * @class Assembly()
 * @desc no
 */

class Assembly extends ModuleBase {

    constructor() {
        super("Assembly")
        this.groups = {}
        this.namespace = null
    }

    /**
     * @function getGroup(name)
     * @desc 獲取一個Group
     */

    getGroup(name) {
        return this.groups[name]
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
        return this.getTool(groupName, name).use()
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        return this.getLine(groupName, name).use()
    }

}

class Tool extends ModuleBase {
    
    constructor(options = {}, group, user) {
        super('Tool')
        this.id = 0
        this.user = user || new Case()
        this.used = []
        this.store = {}
        this.group = group
        this.data = this.$verify( options, {
            name: [true , ''],
            create: [false, function(){}],
            action: [true , '#function'],
            allowDirect: [false , true]
        })
    }

    get name() { return this.data.name }
    get groupCase() { return this.group.case }

    install() {
        this.initSystem()
        this.argumentLength = this.data.action.length
        this.install = null
        this.data.create.bind(this.user)(this.store, {
            group: this.groupCase,
            include: this.include.bind(this)
        })
    }

    initSystem() {
        this.system = {
            store: this.store,
            group: this.groupCase,
            include: this.include.bind(this)
        }
    }

    createExports(supParams) {
        let exps = {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct, 'direct', supParams),
            action: this.createLambda(this.action, 'action', supParams),
            promise: this.createLambda(this.promise, 'promise', supParams)
        }
        let supports = this.createSupport(exps, supParams)
        return Object.assign(exps, supports)
    }

    createSupport(exps, supports) {
        return {
            ng: function(broadcast) {
                if (typeof broadcast === 'function') {
                    supports.ng = broadcast
                    return exps
                }
                this.$systemError('createSupport', 'Ng param not a function.', broadcast)
            },
            packing: function() {
                supports.args = [...arguments]
                return exps
            },
        }
    }

    getError(message) {
        return message || 'unknown error'
    }

    createLambda(func, type, supports) {
        let self = this
        return function () {
            let params = supports.args.concat([...arguments])
            let callback = null
            if (type === 'action') {
                if (typeof params.slice(-1)[0] === 'function') {
                    callback = params.pop()
                } else {
                    self.$systemError('createLambda', 'Action must a callback, no need ? try direct!')
                }
            }
            let args = new Array(self.argumentLength - 3)
            for (let i = 0; i < args.length; i++) {
                args[i] = params[i]
            }
            return func.bind(self)(args, callback, supports)
        }
    }

    include(name) {
        return this.group.getTool(name).use()
    }

    call(params, error, success) {
        this.data.action.call(this.user, ...params, this.system, error, success)
    }

    direct(params, callback, supports){
        if (this.data.allowDirect === false) {
            this.$systemError('direct', 'Not allow direct.', this.data.name)
        }
        let over = false
        let output = null
        let error = (err) => {
            if (over) return
            over = true
            if (supports.ng) {
                supports.ng(this.getError(err))
            } else {
                throw new Error(this.getError(err))
            }
        }
        let success = (data) => {
            if (over) return
            over = true
            output = data
        }
        this.call(params, error, success)
        return output
    }

    action(params, callback = function() {}, supports) {
        let over = false
        let error = (error) => {
            if (over) return
            over = true
            let message = this.getError(error)
            if (supports.ng) {
                supports.ng(message)
            } else {
                callback(message, null)
            }
        }
        let success = (success) => {
            if (over) return
            over = true
            if (supports.ng) {
                callback(success)
            } else {
                callback(null, success)
            }
        }
        this.call(params, error, success)
    }

    promise(params, callback, supports) {
        return new Promise((resolve, reject)=>{
            let over = false
            let error = (error) => {
                if (over) return
                over = true
                let message = this.getError(error)
                if (supports.ng) {
                    supports.ng(this.getError(error))
                }
                reject(message)
            }
            let success = (success) => {
                if (over) return
                over = true
                resolve(success)
            }
            this.call(params, error, success)
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
        let supports = {
            ng: null,
            args: []
        }
        return this.createExports(supports)
    }

}

class Line extends ModuleBase {

    constructor(options, group) {
        super("Line");
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            fail: [true, '#function'],
            input: [true, '#function'],
            output: [true, '#function'],
            inlet: [false, []],
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
            create: [false, function(){}]
        })
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

    // get

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

    callTool(name) {
        return this.getTool(name).use()
    }

    callLine(name) {
        return this.getLine(name).use()
    }

    // compile

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

    // has

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
