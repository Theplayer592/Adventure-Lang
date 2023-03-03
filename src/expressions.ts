import { Lexer, TokenType } from "./parser.js"

// Helper function for comverting to radians
function toRadians(deg: number) {
    return deg * (Math.PI / 180)
}

// Helper function for generating a static range to iterate over
function range(start: number, stop:number = 0):ReadonlyArray<number> {
    const size = stop - start
    return [...Array(size).keys()].map(i => i + start);
}

// Helper function to detect if alphanumeric
function isAlphaNumeric(str) {
    var code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
}

const ops1 = {
    "sin": Math.sin,
    "cos": Math.cos,
    "tan": Math.tan,
    "asin": Math.asin,
    "acos": Math.acos,
    "atan": Math.atan,

    "sind": (n) => { Math.sin(toRadians(n)) },
    "cosd": (n) => { Math.cos(toRadians(n)) },
    "tand": (n) => { Math.tan(toRadians(n)) },
    "asind": (n) => { Math.asin(toRadians(n)) },
    "acosd": (n) => { Math.asin(toRadians(n)) },
    "atand": (n) => { Math.atan(toRadians(n)) },

    "sqrt": Math.sqrt,
    "abs": Math.abs,
    "ceil": Math.ceil,
    "floor": Math.floor,
    "round": Math.round,
    "-": (n) => { return -n },
    "!": (n) => { return !n },
    "exp": Math.exp
}
const ops2 = {
    "+": (n1, n2) => { return n1 + n2 },
    "-": (n1, n2) => { return n1 - n2 },
    "*": (n1, n2) => { return n1 * n2 },
    "/": (n1, n2) => { return n1 / n2 },
    "%": (n1, n2) => { return n1 % n2 },
    "^": (n1, n2) => { return Math.pow(n1, n2) },
    "**": (n1, n2) => { return Math.pow(n1, n2) },
    ",": (a, b) => {
        if(!Array.isArray(a)) {
            return [a, b]
        }
        a.push(b)
        return a
    },
    "==": (n1, n2) => { return n1 === n2 },
    "!=": (n1, n2) => { return n1 !== n2 },
    ">": (n1, n2) => { return n1 > n2 },
    "<": (n1, n2) => { return n1 < n2 },
    ">=": (n1, n2) => { return n1 >= n2 },
    "<=": (n1, n2) => { return n1 <= n2 },
    "&&": (n1, n2) => { return n1 && n2 },
    "||": (n1, n2) => { return n1 || n2 },
    "in": (n1, n2) => { return n1 in n2 },
}
const funcs = {
    // Maximum will be exclusive and minimum inclusive
    "ran": (minMax, minMax2: number =null) => { 
        const min = Math.ceil(minMax2 === null ? 0 : minMax)
        const max = Math.floor(minMax2 === null ? minMax : minMax2)
        return Math.floor(Math.random() * (max - min) + min)
    },
    "log": Math.log
}
const consts = {
    "e": Math.E,
    "pi": Math.PI
}

enum ExprTokenType {
    NUM,
    OP1,
    OP2,
    VAR,
    FNCALL
}

enum ParseTokenType {
    PRIMARY,
    OP,
    FN,
    LP,
    RP,
    COMMA,
    SIGN,
    CALL,
    NUL_CALL
}

class Token {
    private type: ExprTokenType
    private index
    private prio
    private num
    private lexer: Lexer

    constructor(lexer, type, index = "0", prio = 0, num = 0) {
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

    public getNum() {
        return this.num
    }

    public getType(): ExprTokenType {
        return this.type
    }

    public getIndex() {
        return this.index
    }

    public getPrio() {
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
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", 0, vals[token.getIndex()])
                stack.push(item)
            } else if(type === ExprTokenType.OP2 && stack.length > 1) {
                const n2 = stack.pop()
                const n1 = stack.pop()
                const op = ops2[token.getIndex()]
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", 0, op(n1.getNum(), n2.getNum()))
                stack.push(item)
            } else if(type === ExprTokenType.OP1 && stack) {
                const n1 = stack.pop()
                const op = ops1[token.getIndex()]
                const item = new Token(token.getLexer(), ExprTokenType.NUM, "0", 0, op(n1.getNum()))
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
        if(expr !instanceof Expression) expr = new Parser(this.tokens[0].getLexer()).parse(expr.toString())

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
                case ExprTokenType.NUM: {
                    if(typeof token.getNum() === "string") {
                        stack.push("'" + token.getNum() + "'")
                    } else {
                        stack.push(token.getNum())
                    }
                }
                case ExprTokenType.OP2: {
                    const n2 = stack.pop()
                    const n1 = stack.pop()
                    const op = token.getIndex()
                    if(op === "^") {
                        stack.push(`math.pow(${n1}, ${n2})`)
                    } else {
                        stack.push(op === "," ? `${n1}${op}${n2}` : `(${n1}${op}${n2})`)
                    }
                }
                case ExprTokenType.VAR: {
                    stack.push(token.getIndex())
                }
                case ExprTokenType.OP1: {
                    const n1 = stack.pop()
                    const op = token.getIndex()
                    stack.push(op === "-" ? `(${op}${n1})` : `${op}(${n1})`)
                }
                case ExprTokenType.FNCALL: {
                    const n1 = stack.pop()
                    const fn = stack.pop()
                    stack.push(`${fn}(${n1})`)
                }
                default:
                    throw new Error(`Line ${token.getLexer().getLine()}: Invalid expression`)
            }
        })

        if(stack.length > 1) {
            throw new Error(`Line ${this.tokens[this.tokens.length - 1].getLexer().getLine()}: Cannot resolve expression`)
        }

        return stack[0]
    }

    private symbols(): string[] {
        let vars: string[] = []

        this.tokens.forEach((token) => {
            if(token.getType() === ExprTokenType.VAR && token.getIndex() !in vars) vars.push(token.getIndex())
        })

        return vars
    }

    private getVars() {
        return [...this.symbols()]
    }
}

class Operator {
    public token: string
    public priority: number
    public index: string

    constructor(token: string, priority: number, index: string) {
        this.token = token
        this.priority = priority
        this.index = index
    }
}

class Parser {
    private success: boolean = false
    private errrmsg: string = ""
    private expr: string = ""

    private pos: number = 0

    private tokenN: number | string = 0
    private tokenPrio: number = 0
    private tokenI: any = "0"
    private tempPrio: number = 0

    private strQuotes: string[] = ["'", "\""]
    private ops: Operator[] = [
        new Operator("**", 8, "**"),
        new Operator("^", 8, "^"),
        new Operator("%", 6, "%"),
        new Operator("/", 6, "/"),
        new Operator("*", 5, "*"),
        new Operator("+", 4, "+"),
        new Operator("-", 4, "-"),
        new Operator("==", 3, "=="),
        new Operator("!=", 3, "!="),
        new Operator("<=", 3, "<="),
        new Operator(">=", 3, ">="),
        new Operator("<", 3, "<"),
        new Operator(">", 3, ">"),
        new Operator("in", 3, "in"),
        new Operator("!", 2, "!"),
        new Operator("&&", 1, "&&"),
        new Operator("||", 0, "||"),
    ]

    private lexer: Lexer

    constructor(lexer: Lexer) {
        this.lexer = lexer
    }

    public parse(expr: string): Expression {
        this.success = true
        this.tempPrio = 0
        this.expr = expr
        this.pos = 0

        let opstack = []
        let tokenstack = []
        let ops = 0

        let expected = [ ParseTokenType.PRIMARY, ParseTokenType.LP, ParseTokenType.FN, ParseTokenType.SIGN ]
        
        // TODO: Finish
        while(this.pos < this.expr.length) {
            if(this.isOperator()) {
                if(this.isSign() && expected.includes(ParseTokenType.SIGN)) {
                    if(this.isNegSign()) {
                        this.tokenPrio = 5
                        this.tokenI = "-"
                        ops++;
                        this.addFunc(tokenstack, opstack, ExprTokenType.OP1)
                        expected = [ ParseTokenType.PRIMARY, ParseTokenType.LP, ParseTokenType.FN, ParseTokenType.SIGN ]
                    }
                } else if(this.isNot() && expected.includes(ParseTokenType.SIGN)) {
                    this.tokenPrio = 2
                    this.tokenI = "!"
                    ops++;
                    this.addFunc(tokenstack, opstack, ExprTokenType.OP1)
                    expected = [ ParseTokenType.PRIMARY, ParseTokenType.LP, ParseTokenType.FN, ParseTokenType.SIGN ]
                }
            }
        }

        // PLACEHOLDER
        return new Expression([])
    }

    private addFunc(tknstack: Token[], opstack: Token[], type) {
        const op = new Token(
            this.lexer,
            type,
            this.tokenI,
            this.tokenPrio + this.tempPrio,
            0
        )

        while(opstack.length > 0) {
            if(op.getPrio() <= opstack[opstack.length - 1].getPrio()) tknstack.push(opstack.pop())
            else break;
        }

        opstack.push(op)
    }

    private isNumber() {
        let result = false

        if(this.expr[this.pos] === "e") return false

        // Scientific notation
        const sMatch = this.expr.substring(this.pos).match(/([-+]?([0-9]*\.?[0-9]*)[eE][-+]?[0-9]+).*/)
        if(sMatch !== null) {
            this.pos += sMatch[1].length
            this.tokenN = parseFloat(sMatch[1])
            return true
        }

        // Hex notation
        const hMatch = this.expr.substring(this.pos).match(/(0x[0-9a-fA-F]+)/)
        if(hMatch !== null) {
            this.pos += hMatch[1].length
            this.tokenN = parseInt(hMatch[1], 16)
            return true
        }

        // Decimal notation
        let str = ""
        while(this.pos < this.expr.length) {
            const code = this.expr[this.pos]
            if((code.charCodeAt(0) >= "0".charCodeAt(0) && code.charCodeAt(0) <= "9".charCodeAt(0)) || code === ".") {
                if(str.length === 0 && code === ".") str = "0"

                str += code
                this.pos += 1
                this.tokenN = parseFloat(str)
                result = true
            } else break;
        }

        return result
    }

    private unescape(str: string) {
        let buffer = []
        let escaping = false
        
        let i = 0;

        while(i < str.length) {
            const c = str[i]

            if(escaping) {
                switch(c) {
                    case "'": {
                        buffer.push("'")
                        break;
                    }
                    case "\\": {
                        buffer.push("\\")
                        break;
                    }
                    case "b": {
                        buffer.push("\b")
                        break;
                    }
                    case "f": {
                        buffer.push("\f") 
                        break;
                    }
                    case "n": {
                        buffer.push("\n")
                        break;
                    }
                    case "r": {
                        buffer.push("\r")
                        break;
                    }
                    case "t": {
                        buffer.push("\t")
                        break;
                    }
                    case "u": {
                        // Consider the next 4 chars as the hex representation of a unicode val
                        const codePoint = parseInt(str.substring(i + 1, i + 5), 16)
                        buffer.push(String.fromCodePoint(codePoint))
                        i += 4
                        break;
                    }
                    default: throw new Error(`Line ${this.lexer.getLine()}: Illegal escape sequence '\\${c}'`)
                }

                escaping = false
            } else {
                if(c === "\\") escaping = true
                else buffer.push(c)
            }
        }

        return buffer.join("")
    }

    private isStr() {
        const start = this.pos

        let result = false
        let str = ""

        if(this.pos < this.expr.length && this.strQuotes.includes(this.expr[this.pos])) {
            const qtype = this.expr[this.pos]
            this.pos++;

            while(this.pos < this.expr.length) {
                const code = this.expr[this.pos]
                
                if(code != qtype || (str != "" && str[str.length - 1] === "\\")) {
                    str += this.expr[this.pos]
                    this.pos++;
                } else {
                    this.pos++;
                    this.tokenN = this.unescape(str)
                    result = true
                    break;
                }
            }
        }

        return result
    }

    private isConst() {
        for(const key in consts) {
            const l = key.length
            const str = this.expr.substring(this.pos, this.pos + l)

            if(key === str) {
                if(this.expr.length <= this.pos + l) {
                    this.tokenN = consts[key]
                    this.pos += l
                    return true
                }

                if(!isAlphaNumeric(this.expr[this.pos + l]) && this.expr[this.pos + l] != "_") {
                    this.tokenN = consts[key]
                    this.pos += l
                    return true
                }
            }
        }

        return false
    }

    private isOperator() {
        this.ops.forEach((op) => {
            if(this.expr.startsWith(op.token, this.pos)) {
                this.tokenPrio = op.priority
                this.tokenI = op.index
                this.pos += op.token.length
                return true
            }
        })

        return false
    }

    private getCode() {
        return this.expr[this.pos - 1]
    }

    private isSign() {
        return this.getCode() === "+" || this.getCode() === "-"
    }

    private isPosSign() {
        return this.getCode() === "+"
    }

    private isNegSign() {
        return this.getCode() === "-"
    }

    private isNot() {
        return this.getCode() === "!"
    }

    private isLP() {
        const code = this.getCode()
        if(code === "(") {
            this.pos++;
            this.tempPrio += 10
            return true
        }

        return false
    }

    private isRP() {
        const code = this.getCode()
        if(code === ")") {
            this.pos++;
            this.tempPrio -= 10
            return true
        }

        return false
    }

    private isComma() {
        const code = this.getCode()
        if(code === ",") {
            this.pos++;
            this.tokenPrio = -1
            this.tokenI = ","
            return true
        }

        return false
    }

    private isEmpty() {
        const code = this.expr[this.pos]
        if(code.replace(/\s/g, "").length <= 0) {
            this.pos++;
            return true
        }

        return false
    }

    private isOp1() {
        let str = ""
        
        for(const i of range(this.pos, this.expr.length)) {
            const c = this.expr[i]
            if(c.toUpperCase() === c.toLowerCase()) {
                if(i === this.pos || (c != "_" && (c.charCodeAt(0) < 48 || c.charCodeAt(0) > 57))) break;

                str += c
            }
        }

        if(str.length > 0 && str in ops1) {
            this.tokenI = str
            this.tokenPrio = 9
            this.pos += str.length
            return true
        }

        return false
    }

    private isOp2() {
        let str = ""
        
        for(const i of range(this.pos, this.expr.length)) {
            const c = this.expr[i]
            if(c.toUpperCase() === c.toLowerCase()) {
                if(i === this.pos || (c != "_" && (c.charCodeAt(0) < 48 || c.charCodeAt(0) > 57))) break;

                str += c
            }
        }

        if(str.length > 0 && str in ops2) {
            this.tokenI = str
            this.tokenPrio = 9
            this.pos += str.length
            return true
        }

        return false
    }

    private isVar() {
        let str = ""
        let inQoutes = false

        for(const i of range(this.pos, this.expr.length)) {
            const c = this.expr[i]
            if(c.toLowerCase() === c.toUpperCase()) {
                if(((i === this.pos && !this.strQuotes.includes(c)) || (![...this.strQuotes, "_", "."].includes(c)) && (c.charCodeAt(0) < 48 || c.charCodeAt(0) > 57)) && !inQoutes) break;

                if(this.strQuotes.includes(c)) inQoutes = !inQoutes

                str += c
            }
        }

        if(str.length > 0) {
            this.tokenI = str
            this.tokenPrio = 6
            this.pos += str.length
            return true
        }

        return false
    }

}