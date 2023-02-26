import { Parser, TokenType } from "../parser.js"

const validValueTypes = [ TokenType.NUL, TokenType.BOOL, TokenType.STR, TokenType.FUNC, TokenType.VAR, TokenType.ARRAY, TokenType.OBJ, TokenType.NUM, TokenType.EXPR ]

function parseExpression(expr: string) {

}

export default function declareVar(parser: Parser) {
    const varName = parser.lexer.getNext()[0].trim()

    if(parser.lexer.tokenType() !== TokenType.VAR) throw new Error(`Line ${parser.lexer.getLine()}: Expected a variable declaration; the left hand side of a variable declaration must be a variable identifier name`)

    const operator = parser.lexer.getNext()[0].trim()

    if(operator !== "=" || parser.lexer.tokenType() !== TokenType.OPERATOR) throw new Error(`Line ${parser.lexer.getLine()}: Expected assignment operator ('='), not '${operator}'`)

    const value = parser.lexer.getNext()[0]
    const valueType = parser.lexer.tokenType()

    if(!validValueTypes.includes(valueType)) throw new Error(`Line ${parser.lexer.getLine()}: Expected a value or expression, not '${value}'`)

    // Create one large expression from all of the following tokens, up until an EOI token
    let fullExpr = "("
    let token = value
    let tokenType = valueType
    while(tokenType !== TokenType.EOI) {
        if(!validValueTypes.includes(tokenType)) throw new Error(`Line ${parser.lexer.getLine()}: Expected a value or expression, not '${value}'`)
    
        fullExpr += token
    }

    fullExpr += ")"
}