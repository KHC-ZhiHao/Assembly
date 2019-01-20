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