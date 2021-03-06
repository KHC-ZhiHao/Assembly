let Assembly = require('../dist/index')

let group = new Assembly.Group({
    create() {}
})

group.addMold({
    name: 'number',
    check(param) {
        return typeof param === 'number' ? true : 'Not a number.'
    }
})

group.addTool({
    name: 'sum',
    molds: [null, 'number'],
    paramLength: 2,
    allowDirect: true,
    create: function(store, { include, group }) {},
    action: function(a, b, system, error, success) {
        success(a + b)
    }
})

group.addTool({
    name: 'double',
    molds: ['number'],
    paramLength: 1,
    allowDirect: true,
    create: function(store, { include, group }) {
        this.coefficient = 2
    },
    action: function(number, system, error, success) {
        success(number * this.coefficient)
    }
})

group.addLine({
    name: 'line',
    inlet: null,
    input: function(number, { include }, error, start) {
        this.number = number
        start()
    },
    output: function({ include }, error, success) {
        success(this.number)
    },
    fail: function(err, report) {
        report(err)
    },
    layout: {
        add: function(number, { include }, error, next) {
            this.number = include('sum').ng(error).direct(this.number, number)
            next()
        },
        double: function({ include }, error, next) {
            this.number = include('double').ng(error).action(this.number)
            next()
        }
    }
})

module.exports = group