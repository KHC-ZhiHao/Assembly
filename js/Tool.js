/**
 * @class Tool
 * @desc Assembly的最小單位，負責執行指定邏輯
 */

class Tool extends ModuleBase {

    constructor(options = {}, group, user) {
        super('Tool')
        this.id = 0
        this.user = user || new Case()
        this.used = []
        this.store = {}
        this.group = group
        this.data = this.$verify(options, {
            name: [true, ''],
            create: [false, function () { }],
            action: [true, '#function'],
            allowDirect: [false, true],
            paramLength: [false, 0]
        })
    }

    get name() { return this.data.name }
    get groupCase() { return this.group.case }

    install() {
        this.initSystem()
        this.initArgLength()
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

    initArgLength() {
        this.argumentLength = this.data.paramLength !== 0 ? this.data.paramLength : this.data.action.length - 3
        if (this.argumentLength < 0) {
            this.argumentLength = ModuleBase.getArgsLength(this.data.action) - 3
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
            ng: function (broadcast) {
                if (typeof broadcast === 'function') {
                    supData.noGood = broadcast
                    return exps
                }
                this.$systemError('createSupport', 'Ng param not a function.', broadcast)
            },
            packing: function () {
                supData.package = supData.package.concat([...arguments])
                return exps
            },
            unPacking: function () {
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
        return function () {
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
