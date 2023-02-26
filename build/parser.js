import declareVar from "./keywords/var.js";
var TokenType;
(function (TokenType) {
    TokenType[TokenType["NUL"] = 0] = "NUL";
    TokenType[TokenType["BOOL"] = 1] = "BOOL";
    TokenType[TokenType["STR"] = 2] = "STR";
    TokenType[TokenType["FUNC"] = 3] = "FUNC";
    TokenType[TokenType["KEYWORD"] = 4] = "KEYWORD";
    TokenType[TokenType["VAR"] = 5] = "VAR";
    TokenType[TokenType["ARRAY"] = 6] = "ARRAY";
    TokenType[TokenType["OBJ"] = 7] = "OBJ";
    TokenType[TokenType["OPERATOR"] = 8] = "OPERATOR";
    TokenType[TokenType["NUM"] = 9] = "NUM";
    TokenType[TokenType["EOL"] = 10] = "EOL";
})(TokenType || (TokenType = {}));
class Value {
}
class TreeNode {
    type;
    value;
    constructor(tokenType) {
        this.type = tokenType;
    }
}
class Lexer {
    lineN;
    expr;
    rawTokens;
    tokens;
    i;
    j;
    lexerRegex = /(null)|(true|false)|((\"(\\.|[^\"\\])*\")|(\'(\\.|[^'\\])*\'))|(([a-zA-Z][a-zA-Z0-9_]*)\s*(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)))|(global|path|prompt|print|end|run|entity|property|value|max|min|create|spawn|kill|if|elif|else|while|var|const)|(\[([^]*)\])|(\{([^]*)\})|([a-zA-Z][a-zA-Z0-9_]*)|(\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/|#.*)|(==|!=|>=|<=|\*\*|&&|\|\||!|>|<|=|%|\+|-|\*)|([+\-]?([0-9]+([.][0-9]*)?|[.][0-9]+))|(\S+)|(\n)/gm;
    constructor(expression) {
        this.expr = expression;
        this.i = 0;
        this.j = 0;
        this.lineN = 1;
    }
    getLine() {
        return this.lineN;
    }
    getNext() {
        this.i++;
        return this.rawTokens[this.i - 1];
    }
    hasNext() {
        return this.i < this.rawTokens.length;
    }
    tokenType() {
        this.j++;
        while (this.tokens[this.j - 1] === TokenType.EOL) {
            this.j++;
            this.lineN++;
        }
        return this.tokens[this.j - 1];
    }
    lex() {
        const matches = [...this.expr.matchAll(this.lexerRegex)];
        this.rawTokens = matches;
        this.tokens = [];
        let lineN = 1;
        this.rawTokens.forEach((match, j) => {
            (match[0].includes("\n") ? match[0].match(/\n/g) : []).forEach(() => {
                this.tokens.push(TokenType.EOL);
                lineN++;
            });
            if (match[1] !== undefined) {
                this.tokens.push(TokenType.NUL);
            }
            else if (match[2] !== undefined) {
                this.tokens.push(TokenType.BOOL);
            }
            else if (match[3] !== undefined) {
                this.tokens.push(TokenType.STR);
            }
            else if (match[8] !== undefined) {
                this.tokens.push(TokenType.FUNC);
            }
            else if (match[11] !== undefined) {
                this.tokens.push(TokenType.KEYWORD);
            }
            else if (match[12] !== undefined) {
                this.tokens.push(TokenType.ARRAY);
            }
            else if (match[14] !== undefined) {
                this.tokens.push(TokenType.OBJ);
            }
            else if (match[16] !== undefined) {
                this.tokens.push(TokenType.VAR);
            }
            else if (match[17] !== undefined) {
            }
            else if (match[18] !== undefined) {
                this.tokens.push(TokenType.OPERATOR);
            }
            else if (match[19] !== undefined) {
                this.tokens.push(TokenType.NUM);
            }
            else if (match[22] !== undefined) {
                throw new Error(`Line ${lineN}: Unexpected token '${match[0]}'`);
            }
        });
        this.rawTokens = this.rawTokens.filter((v, i) => {
            if (v[23] !== undefined)
                return false;
            return true;
        });
        console.log(this.tokens);
    }
}
export class Parser {
    lexer;
    constructor(expr, startingLine = 1, trace = []) {
        this.lexer = new Lexer(expr);
        this.lexer.lex();
        this.parse();
    }
    parse() {
        while (this.lexer.hasNext()) {
            const token = this.lexer.getNext()[0].trim();
            const tokenType = this.lexer.tokenType();
            console.log(token, tokenType);
            if (tokenType === TokenType.KEYWORD) {
                switch (token) {
                    case "var":
                        declareVar(this);
                }
            }
        }
    }
}
export { TokenType };
