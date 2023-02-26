import declareVar from "./keywords/var.js"
import StateManager from "./state.js"

enum TokenType {
    NUL,
    BOOL,
    STR,
    FUNC,
    KEYWORD,
    VAR,
    ARRAY,
    OBJ,
    OPERATOR,
    NUM,
    EXPR,
    EOI, // End Of Instruction
    EOL
}

class Lexer {
    private lineN: number

    private expr: string
    private rawTokens: RegExpMatchArray[]
    private tokens: Array<TokenType>
    private i: number
    private j: number

    private lexerRegex: RegExp = /(null)|(true|false)|((\"(\\.|[^\"\\])*\")|(\'(\\.|[^'\\])*\'))|(([a-zA-Z][a-zA-Z0-9_]*)\s*(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)))|(global|path|prompt|print|end|run|entity|property|value|max|min|create|spawn|kill|if|elif|else|while|var|const)|(\[(.|\n)*\])|(\{(.|\n)*\})|([a-zA-Z][a-zA-Z0-9_]*)|(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|#.*)|(==|!=|>=|<=|\*\*|&&|\|\||!|>|<|=|%|\+|-|\*)|([+\-]?([0-9]+([.][0-9]*)?|[.][0-9]+))|(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))|(;)|(\S+)|(\n)/gm

    constructor(expression) {
        this.expr = expression
        this.i = 0
        this.j = 0
        this.lineN = 1
    }

    public getLine(): number {
        return this.lineN
    }

    public getNext(): RegExpMatchArray {
        this.i++;

        return this.rawTokens[this.i - 1]
    }

    public hasNext(): boolean {
        return this.i < this.rawTokens.length
    }

    public tokenType(): TokenType {
        this.j++;
        
        // Increase the line number if we encounter any EOL tokens
        while(this.tokens[this.j - 1] === TokenType.EOL) {
            this.j++;
            this.lineN++;
        }

        return this.tokens[this.j - 1]
    }

    public lex(): void {
        const matches: RegExpMatchArray[] = [...this.expr.matchAll(this.lexerRegex)]
        this.rawTokens = matches
        this.tokens = []

        let lineN = 1

        this.rawTokens.forEach((match, j): void => {
            // Append EOL tokens
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
                //this.tokens.push(TokenType.COMMENT)
                //Ignore comments
            } else if (match[18] !== undefined) {
                this.tokens.push(TokenType.OPERATOR)
            } else if (match[19] !== undefined) {
                this.tokens.push(TokenType.NUM)
            } else if(match[22] !== undefined) {
                this.tokens.push(TokenType.EXPR)
            } else if(match[23] !== undefined) {
                this.tokens.push(TokenType.EOI)
            } else if (match[24] !== undefined) {
                // If we do not recognise the token, throw an error
                throw new Error(`Line ${lineN}: Unexpected token '${match[0]}'`)
            }
        })

        // Remove any tokens which are only new lines (we do not want to have to iterate over these later)
        this.rawTokens = this.rawTokens.filter((v, i) => {
            if(v[25] !== undefined) return false
            return true
        })

        console.log(this.tokens)
    }
}

class Parser {
    public globalState: StateManager
    public lexer: Lexer

    constructor(expr, startingLine = 1, trace = []) {
        this.lexer = new Lexer(expr)
        this.globalState = new StateManager(this.lexer)
        this.lexer.lex()
        this.parse()
    }

    private parse() {
        // While there are still tokens in the array, parse the next tokens
        while (this.lexer.hasNext()) {
            const token = this.lexer.getNext()[0].trim()
            const tokenType = this.lexer.tokenType()

            //console.log(token, tokenType)

            if(tokenType === TokenType.KEYWORD) {
                switch(token) {
                    case "var":
                        declareVar(this)
                }
            }
        }
    }
}

export { Lexer, Parser, TokenType }