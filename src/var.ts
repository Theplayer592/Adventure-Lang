import { TokenType } from "./parser.js"
import StateManager from "./state.js"

type VarType = TokenType.NUL | TokenType.BOOL | TokenType.STR | TokenType.FUNC | TokenType.ARRAY | TokenType.OBJ | TokenType.NUM 

class Var {
    public type: VarType
}

class BoolVar extends Var {
    public value: boolean
    public nullable: boolean
    public isNull: boolean

    constructor() {
        super()
        this.type = TokenType.BOOL
    }
}

class StrVar extends Var {
    public value: string
    public nullable: boolean
    public isNull: boolean

    constructor() {
        super()
        this.type = TokenType.STR
    }
}

// Functions will technically be variables
class Func extends Var {
    public internalState: StateManager

    constructor() {
        super()
        this.type = TokenType.FUNC
    }
}

class ArrayVar extends Var {
    public value: Var[]
    public nullable: boolean
    public isNull: boolean

    constructor() {
        super()
        this.type = TokenType.ARRAY
    }
}

class ObjVar extends Var {
    public value: {
        [key: string]: Var
    }
    public nullable: boolean
    public isNull: boolean

    constructor() {
        super()
        this.type = TokenType.OBJ
    }
}

class NumVar extends Var {
    public value: number
    public nullable: boolean
    public isNull: boolean

    constructor() {
        super()
        this.type = TokenType.OBJ
    }
}

export { ArrayVar, BoolVar, Func, NumVar, ObjVar, StrVar, Var, VarType }