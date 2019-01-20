let Assembly = require('../dist/Assembly')

// merger 對象必須是個alone單位

let group = new Assembly.Group({
    merger: {
        valid: require('./valid')
    },
    create() {}
})

group.addTool({
    name: 'sum',
    allowDirect: true,
    paramLength: 2,
    create: function(store, { include, group }) {},
    action: function(a, b, { coop }, error, success) {
        coop('valid').tool('isNumbers').ng(error).action([a, b], (err) => {
            success(a + b)
        })
    }
})

group.addTool({
    name: 'double',
    allowDirect: true,
    create: function(store, { include, group }) {
        this.coefficient = 2
    },
    action: function(number, { coop }, error, success) {
        coop('valid').tool('isNumbers').ng(error).action([number], (err) => {
            success(number * this.coefficient)
        })
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
            include('sum').ng(error).action(this.number, number, (result) => {
                this.number = result
                next()
            })
        },
        double: function({ include }, error, next) {
            include('double').ng(error).action(this.number, (result) => {
                this.number = result
                next()
            })
        }
    }
})

module.exports = group