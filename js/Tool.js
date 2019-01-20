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
