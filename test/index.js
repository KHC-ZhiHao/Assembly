let Assembly = require('../dist/Assembly')
let factory = new Assembly()

factory.setBridge((factory, groupName, toolName) => {
	if (factory.hasGroup(groupName) === false) {
        factory.addGroup(groupName, require(`./${groupName}`))
    }
})

factory.tool('math', 'double').ng((err) => {
    console.log(err)
}).action(80, (result) => {
    console.log(result)
})