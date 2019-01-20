class Functions {

    static getArgsLength(func) {
        var funcStr = func.toString()
        var commaCount = 0
        var bracketCount = 0
        var lastParen = 0
        var inStrSingle = false
        var inStrDouble = false
        for (var i = 0; i < funcStr.length; i++) {
            if (['(', '[', '{'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount++
                lastParen = i
            } else if ([')', ']', '}'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount--
                if (bracketCount < 1) {
                    break;
                }
            } else if (funcStr[i] === "'" && !inStrDouble && funcStr[i - 1] !== '\\') {
                inStrSingle = !inStrSingle
            } else if (funcStr[i] === '"' && !inStrSingle && funcStr[i - 1] !== '\\') {
                inStrDouble = !inStrDouble
            } else if (funcStr[i] === ',' && bracketCount === 1 && !inStrSingle && !inStrDouble) {
                commaCount++
            }
        }
        if (commaCount === 0 && funcStr.substring(lastParen + 1, i).trim().length === 0) {
            return 0;
        }
        return commaCount + 1
    }

}