import { Lexer, TokenType } from "./parser.js"

const ops1 = {}
const ops2 = {}
const funcs = {}

enum ExprTokenType {
    NUM,
    OP1,
    OP2,
    VAR,
    FNCALL
}

class Token {
    private type: ExprTokenType
    private index: string
    private prio: string
    private num: number | string
    private lexer: Lexer

    constructor(lexer, type, index = "0", prio = "0", num: number | string = 0) {
        this.lexer = lexer
        this.type = type
        this.index = index
        this.prio = prio
        this.num = num
    }

    public getVal(): string {
        switch(this.type) {
            case ExprTokenType.NUM:
                return String(this.num)
            case ExprTokenType.OP1:
            case ExprTokenType.OP2:
            case ExprTokenType.VAR:
                return String(this.index)
            case ExprTokenType.FNCALL:
                return "$CALL"
            default:
                throw new Error(`Line ${this.lexer.getLine()}: Invalid Token`)
        }
    }

    public getNum(): string | number {
        return this.num
    }

    public getType(): ExprTokenType {
        return this.type
    }

    public getIndex(): string {
        return this.index
    }

    public getPrio(): string {
        return this.prio
    }

    public getLexer(): Lexer {
        return this.lexer
    }
}

class Expression {
    private tokens: Token[]

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    private simplify(vals = {}) {
        let stack: Token[] = []
        let exprs = []

        this.tokens.forEach((token, i) => {
            const type = token.getType()

            if(type === ExprTokenType.NUM) {
                stack.push(token)
            } else if(type === ExprTokenType.VAR && token.getIndex() in vals) {
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", "0", vals[token.getIndex()])
                stack.push(item)
            } else if(type === ExprTokenType.OP2 && stack.length > 1) {
                const n2 = stack.pop()
                const n1 = stack.pop()
                const op = ops2[token.getIndex()]
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", "0", op(n1.getNum(), n2.getNum()))
                stack.push(item)
            } else if(type === ExprTokenType.OP1 && stack) {
                const n1 = stack.pop()
                const op = ops1[token.getIndex()]
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", "0", op(n1.getNum()))
                stack.push(item)
            } else {
                while(stack.length > 0) {
                    exprs.push(stack.splice(0, 1))
                }
                exprs.push(token)
            }

            while(stack.length > 0) {
                exprs.push(stack.splice(0, 1))
            }

            return new Expression(exprs)
        })
    }

    private sub(variable: string, expr: Expression) {
        if(expr !instanceof Expression) expr = new Parser().parse(expr.toString())

        let exprs: Token[] = []

        this.tokens.forEach((val, i) => {
            if(val.getType() == ExprTokenType.VAR && val.getIndex() == variable) {
                expr.tokens.forEach((exprVal, j) => {
                    const item = new Token(exprVal.getLexer(), exprVal.getType(), exprVal.getIndex(), exprVal.getPrio(), exprVal.getNum())
                    exprs.push(item)
                })
            } else {
                exprs.push(val)
            }
        })

        return new Expression(exprs)
    }

    public eval(vals = {}) {
        let stack = []
        this.tokens.forEach((token, i) => {
            const type = token.getType()

            if(type === ExprTokenType.NUM) {
                stack.push(token.getNum())
            } else if (type === ExprTokenType.OP2) {
                const n2 = stack.pop()
                const n1 = stack.pop()
                const op = ops2[token.getIndex()]
                stack.push(op(n1, n2))
            } else if(type === ExprTokenType.VAR) {
                if(token.getIndex() in vals) {
                    stack.push(vals[token.getIndex()])
                } else if(token.getIndex() in funcs) {
                    stack.push(funcs[token.getIndex()])
                } else {
                    throw new Error(`Line ${token.getLexer().getLine()}: Cannot find variable '${token.getIndex()}'`)
                }
            } else if(type === ExprTokenType.OP1) {
                const n1 = stack.pop()
                const op = ops1[token.getIndex()]
                stack.push(op(n1))
            } else if(type === ExprTokenType.FNCALL) {
                const n1 = stack.pop()
                const op = stack.pop()
                if(typeof op === "function") {
                    if(Array.isArray(n1)) {
                        stack.push(op(...n1))
                    } else {
                        stack.push(op(n1))
                    }
                } else {
                    throw new Error(`Line ${token.getLexer().getLine()}: cannot find callable '${op}'`)
                }
            } else {
                throw new Error(`Line ${token.getLexer().getLine()}: Invalid expression`)
            }
        })

        if(stack.length > 1) {
            throw new Error(`Line ${this.tokens[this.tokens.length - 1].getLexer().getLine()}: Could not resolve expression`)
        }

        return stack[0]
    }

    public toString(): string {
        let stack = []

        this.tokens.forEach((token, i) => {
            const type = token.getType()
            switch(type) {
                case ExprTokenType.NUM:
                    if(typeof token.getNum() === "string") {
                        stack.push("'" + token.getNum() + "'")
                    } else {
                        stack.push(token.getNum())
                    }
            }
        })
        return ""
    }
}

class Parser {
    public parse(expr: string): Expression {
        return new Expression([])
    }
}