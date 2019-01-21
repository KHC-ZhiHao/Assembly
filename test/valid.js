let Assembly = require('../dist/Assembly')
let group = new Assembly.Group()

group.addTool({
    name: 'isNumbers',
    allowDirect: true,
    create: function(store, { include, group }) {},
    action: function(params, { include }, error, success) {
        let values = params.filter((n) => {
            return typeof n !== 'number'
        })
        if (values.length === 0) {
            success(true)
        } else {
            error('no number')
        }
    }
})

module.exports = group
