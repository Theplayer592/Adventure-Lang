// This handles the state of the program: it manages variables & objects \\

import { Lexer, TokenType } from "./parser.js"
import { Var } from "./var.js"

export default class StateManager {
    private parent?: StateManager

    private subInstances: StateManager[]
    private lexer: Lexer

    public  vars: {
        [key: string]: Var
    }

    constructor(lexer: Lexer, parent?: StateManager) {
        this.lexer = lexer
        this.parent = parent
    }

    public declareVar(name: string, val: Var): void {
        if(name in this.vars) throw new Error(`Line ${this.lexer.getLine()}: Variable '${name}' has already been declared within this scope`)

        this.vars[name] = val
    }

    public setVar(name: string, val: Var): void {
        let found = false
        let current = this


        while(!found && current.getParent() !== null) {
            if(name in current.vars) {
                found = true
                current.vars[name] = val
            }
        }

        if(!found) throw new Error(`Line ${this.lexer.getLine()}: Cannot find referenced variable '${name}'`)
    }

    public getVar(name: string): Var {
        let found = false
        let current = this


        while(!found && current.getParent() !== null) {
            if(name in current.vars) {
                found = true
                return current.vars[name]
            }
        }

        if(!found) throw new Error(`Line ${this.lexer.getLine()}: Cannot find referenced variable '${name}'`)
    }

    public getParent(): StateManager {
        return this.parent
    }
}