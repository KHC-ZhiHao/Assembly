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
            this.main.fail(error, (report) => {
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