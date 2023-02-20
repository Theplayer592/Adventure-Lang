WHERE npm
IF %ERRORLEVEL% NEQ 0 ECHO "npm wasn't found" && exit 1

WHERE node
IF %ERRORLEVEL% NEQ 0 ECHO "node wasn't found" && exit 1

call npm install -g npm
call npm install
call npm install typescript --save-dev
call npm test