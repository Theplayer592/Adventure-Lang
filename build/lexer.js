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
    TokenType[TokenType["COMMENT"] = 8] = "COMMENT";
    TokenType[TokenType["OPERATOR"] = 9] = "OPERATOR";
    TokenType[TokenType["NUM"] = 10] = "NUM";
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
export default class Lexer {
    expr;
    rawTokens;
    tokens;
    i;
    lexerRegex = /(null)|(true|false)|((\"(\\.|[^\"\\])*\")|(\'(\\.|[^'\\])*\'))|(([a-zA-Z][a-zA-Z0-9_]+)\s*(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)))|(global|path|prompt|print|end|run|entity|property|value|max|min|create|spawn|kill|if|elif|else|while|var|const)|(\[(.|\n|\r)*\])|(\{(.|\n|\r)*\})|([a-zA-Z][a-zA-Z0-9_]*)|(###(.|\n|\r)*###|#.*)|(==|!=|>=|<=|\*\*|&&|\|\||!|>|<|=|%|\+|-|\*)|([+\-]?([0-9]+([.][0-9]*)?|[.][0-9]+))/g;
    constructor(expression) {
        this.expr = expression;
        this.i = 0;
    }
    getNext() {
        this.i++;
        return this.rawTokens[this.i - 1];
    }
    hasNext() {
        return this.i < this.rawTokens.length;
    }
    nextToken() {
        return this.tokens[this.i];
    }
    lex() {
        const matches = [...this.expr.matchAll(this.lexerRegex)];
        this.rawTokens = matches.filter((v, j) => {
            return v[0].trim() !== "";
        });
        this.tokens = [];
        console.log(this.rawTokens);
        this.rawTokens.forEach((match, j) => {
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
                this.tokens.push(TokenType.COMMENT);
            }
            else if (match[19] !== undefined) {
                this.tokens.push(TokenType.OPERATOR);
            }
            else if (match[20] !== undefined) {
                this.tokens.push(TokenType.NUM);
            }
        });
        console.log(this.tokens);
    }
}
