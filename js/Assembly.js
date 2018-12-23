/**
 * @class Assembly()
 * @desc no
 */

class Assembly extends ModuleBase {

    constructor() {
        super("Assembly")
        this.groups = {};
    }

    /**
     * @function getGroup(name)
     * @desc 獲取一個Group
     */

    getGroup(name) {
        return this.groups[name]
    }

    /**
     * @function getTool(groupName,name)
     * @desc 獲取一個Tool
     */

    getTool(groupName, name) {
        return this.getGroup(groupName).getTool(name)
    }

    /**
     * @function getLine(groupName,name)
     * @desc 獲取一個Curried Function
     */

    getLine(groupName, name) {
        return this.getGroup(groupName).getLine(name)
    }

    /**
     * @function addGroup(name,group,options)
     * @desc 加入一個Group
     * @param {object} options group被初始化時能夠接收到的外部物件
     */

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if (group instanceof Group) {
                if (group.create) {
                    group.create(options)
                }
                this.groups[name] = group
            } else {
                this.$systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.$systemError('addGroup', 'Name already exists.', name)
        }
    }

    /**
     * @function hasGroup(name)
     * @desc 加入一個Group
     */

    hasGroup(name) {
        return !!this.groups[name]
    }

    /**
     * @function hasTool(groupName,name)
     * @desc 有無註冊過Tool
     */

    hasTool(groupName, name) {
        return !!this.getGroup(groupName).hasTool(name)
    }

    /**
     * @function hasLine(groupName,name)
     * @desc 有無柯理化的function
     */

    hasLine(groupName, name) {
        return !!this.getGroup(groupName).hasLine(name)
    }

    /**
     * @function tool(groupName,name)
     * @desc 呼叫一個tool，當然...它仍是一個具有action, promise等功能的物件
     */

    tool(groupName, name) {
        return this.getTool(groupName, name).use()
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        return this.getLine(groupName, name).use()
    }

}
