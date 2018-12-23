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
        this.export = {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct, 'direct'),
            action: this.createLambda(this.action, 'action'),
            promise: this.createLambda(this.promise, 'promise')
        }
    }

    initSystem() {
        this.system = {
            store: this.store,
            group: this.groupCase,
            include: this.include.bind(this)
        }
    }

    getError(message) {
        return message || 'unknown error'
    }

    createLambda(func, type) {
        let self = this
        return function () {
            let params = [...arguments]
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
            return func.bind(self)(args, callback)
        }
    }

    include(name) {
        return this.group.getTool(name).use()
    }

    call(params, error, success) {
        this.data.action.call(this.user, ...params, this.system, error, success)
    }

    direct(params){
        if (this.data.allowDirect === false) {
            this.$systemError('direct', 'Not allow direct.', this.data.name)
        }
        let output = null
        let error = (error) => {
            throw new Error(this.getError(error))
        }
        let success = (data) => {
            output = data
        }
        this.call(params, error, success)
        return output
    }

    action(params, callback = function() {}) {
        let error = (error) => {
            callback(this.getError(error), null)
        }
        let success = (success) => {
            callback(null, success)
        }
        this.call(params, error, success)
    }

    promise(params) {
        return new Promise((resolve, reject)=>{
            let error = (error) => {
                reject(this.getError(error))
            }
            this.call(params, error, resolve)
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
        return this.export
    }

}
