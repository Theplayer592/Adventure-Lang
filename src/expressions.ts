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
    private i: number
    private prio: number
    private num: number
    private lexer: Lexer

    constructor(lexer, type, i = 0, prio = 0, num = 0) {
        this.lexer = lexer
        this.type = type
        this.i = i
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
                return String(this.i)
            case ExprTokenType.FNCALL:
                return "$CALL"
            default:
                throw new Error(`Line ${this.lexer.getLine()}: Invalid Token`)
        }
    }

    public getNum(): number {
        return this.num
    }

    public getType(): ExprTokenType {
        return this.type
    }

    public getIndex(): string {
        return String(this.i)
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
                const item = new Token(ExprTokenType.NUM, 0, 0, vals[token.getIndex()])
                stack.push(item)
            } else if(type === ExprTokenType.OP2 && stack.length > 1) {
                const n2 = stack.pop()
                const n1 = stack.pop()
                const op = ops2[token.getIndex()]
                const item = new Token(ExprTokenType.NUM, 0, 0, op(n1.getNum(), n2.getNum()))
            } else if(type === ExprTokenType.OP1 && stack) {
                const n1 = stack.pop()
                const op = ops1[token.getIndex()]
                const item = new Token(ExprTokenType.NUM, 0, 0, op(n1.getNum()))
                stack.push(item)
            } else {
                while(stack.length > 0) {
                    exprs.push(stack.pop())
                }
                exprs.push(token)
            }

            while(stack.length > 0) {
                exprs.push(stack.pop())
            }
        })
    }
}