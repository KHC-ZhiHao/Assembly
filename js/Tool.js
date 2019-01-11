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
