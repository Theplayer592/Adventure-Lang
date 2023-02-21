import { kill } from "process"

enum TokenType {
    NUL,
    BOOL,
    STR,
    FUNC,
    KEYWORD,
    VAR,
    ARRAY,
    OBJ,
    COMMENT,
    OPERATOR,
    NUM,
    EOL
}

class Value {

}

class TreeNode {
    public type: TokenType
    public value: Value

    constructor(tokenType) {
        this.type = tokenType
    }
}

class Lexer {
    private expr: string
    private rawTokens: RegExpMatchArray[]
    private tokens: Array<TokenType>
    private tokensNoEOL: Array<TokenType>
    private i: number

    private lexerRegex: RegExp = /(null)|(true|false)|((\"(\\.|[^\"\\])*\")|(\'(\\.|[^'\\])*\'))|(([a-zA-Z][a-zA-Z0-9_]*)\s*(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)))|(global|path|prompt|print|end|run|entity|property|value|max|min|create|spawn|kill|if|elif|else|while|var|const)|(\[([^]*)\])|(\{([^]*)\})|([a-zA-Z][a-zA-Z0-9_]*)|(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|#.*)|(==|!=|>=|<=|\*\*|&&|\|\||!|>|<|=|%|\+|-|\*)|([+\-]?([0-9]+([.][0-9]*)?|[.][0-9]+))|(\S+)/gm

    constructor(expression) {
        this.expr = expression
        this.i = 0
    }

    public getNext(): RegExpMatchArray {
        this.i++;
        return this.rawTokens[this.i - 1]
    }

    public hasNext(): boolean {
        return this.i < this.rawTokens.length
    }

    public tokenType(): TokenType {
        return this.tokensNoEOL[this.i - 1]
    }

    public lex(): void {
        const matches: RegExpMatchArray[] = [...this.expr.matchAll(this.lexerRegex)]
        this.rawTokens = matches
        this.tokens = []
        this.tokensNoEOL = []

        let lineN = 1

        this.rawTokens.forEach((match, j): void => {
            (match[0].includes("\n") ? match[0].match(/\n/g) : []).forEach(() => {
                this.tokens.push(TokenType.EOL)
                lineN++;
            })


            if (match[1] !== undefined) {
                this.tokens.push(TokenType.NUL)
            } else if (match[2] !== undefined) {
                this.tokens.push(TokenType.BOOL)
            } else if (match[3] !== undefined) {
                this.tokens.push(TokenType.STR)
            } else if (match[8] !== undefined) {
                this.tokens.push(TokenType.FUNC)
            } else if (match[11] !== undefined) {
                this.tokens.push(TokenType.KEYWORD)
            } else if (match[12] !== undefined) {
                this.tokens.push(TokenType.ARRAY)
            } else if (match[14] !== undefined) {
                this.tokens.push(TokenType.OBJ)
            } else if (match[16] !== undefined) {
                this.tokens.push(TokenType.VAR)
            } else if (match[17] !== undefined) {
                this.tokens.push(TokenType.COMMENT)
            } else if (match[18] !== undefined) {
                this.tokens.push(TokenType.OPERATOR)
            } else if (match[19] !== undefined) {
                this.tokens.push(TokenType.NUM)
            } else if (match[22] !== undefined) {
                throw new Error(`Line ${lineN}: Unexpected token '${match[0]}'`)
            }

            const last = this.tokens[this.tokens.length - 1]
            if(last !== TokenType.EOL) this.tokensNoEOL.push(last)
        })

        console.log(this.tokens)
    }
}

export default class Parser {
    private lexer: Lexer
    private lineN: number

    constructor(expr, startingLine = 1, trace = []) {
        this.lexer = new Lexer(expr)
        this.lexer.lex()
        this.parse()
    }

    private parse() {
        while (this.lexer.hasNext()) {
            const token = this.lexer.getNext()[0]
            const tokenType = this.lexer.tokenType()

            console.log(token, tokenType)
        }
    }
}