if ! npm -v &> /dev/null
  then
    echo "npm must be installed for program to run"
    exit 1
fi

if ! node -v &> /dev/null
  then 
    echo "node.js must be installed for program to run"
    exit 1
fi

npm install -g npm
npm install
npm install typescript --save-dev
npm test