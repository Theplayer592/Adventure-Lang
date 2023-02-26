import { TokenType } from "../parser.js";
const validValueTypes = [TokenType.NUL, TokenType.BOOL, TokenType.STR, TokenType.FUNC, TokenType.VAR, TokenType.ARRAY, TokenType.OBJ, TokenType.NUM];
export default function declareVar(parser) {
    const varName = parser.lexer.getNext()[0];
    if (parser.lexer.tokenType() !== TokenType.VAR)
        throw new Error(`Line ${parser.lexer.getLine()}: Expected a variable declaration; the left hand side of a variable declaration must be a variable identifier name`);
    const operator = parser.lexer.getNext()[0];
    if (operator !== "=" || parser.lexer.tokenType() !== TokenType.OPERATOR)
        throw new Error(`Line ${parser.lexer.getLine()}: Expected assignment operator ('='), not '${operator}'`);
    const value = parser.lexer.getNext()[0];
    const valueType = parser.lexer.tokenType();
    if (!validValueTypes.includes(valueType))
        ;
}
