/**
 * @class Assembly()
 * @desc 主核心
 */

class Assembly extends ModuleBase {

    /**
     * @member {object} groups group的集結包
     * @member {function} bridge 每次請求時的一個呼叫函數
     */

    constructor() {
        super("Assembly")
        this.groups = {}
        this.bridge = null
    }

    /**
     * @function getGroup(name)
     * @desc 獲取一個Group
     */

    getGroup(name) {
        if (this.hasGroup(name)) {
            return this.groups[name]
        } else {
            this.$systemError('getGroup', 'Group not found.')
        }
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
        if (this.groups[name] != null){
            this.$systemError('addGroup', 'Name already exists.', name)
            return
        }
        if ((group instanceof Group) === false) {
            this.$systemError('addGroup', 'Must group.', group)
            return
        }
        if (group.mode === 'alone') {
            this.$systemError('addGroup', 'Group is alone.', group)
            return
        }
        if (group.create) {
            group.create(options)
        }
        this.groups[name] = group
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
        this.callBridge(groupName, name)
        return this.getTool(groupName, name).use()
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        this.callBridge(groupName, name)
        return this.getLine(groupName, name).use()
    }

    /**
     * @function callBridge
     * @desc 呼叫橋接器
     */

    callBridge(groupName, name) {
        if (this.bridge) {
            this.bridge(this, groupName, name)
        }
    }

    /**
     * @function setBridge
     * @desc 建立橋接器，在任何呼叫前執行一個function
     * @param {function} bridge 
     */

    setBridge(bridge) {
        if (typeof bridge === 'function') {
            this.bridge = bridge
        } else {
            this.$systemError('setBridge', 'Bridge not a function.', bridge)
        }
    }

}
