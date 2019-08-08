const SHA256 = require("crypto-js/sha256");

function calculateHash(data) {
    return SHA256(data).toString();
}

function Transaction(fromAddress, toAddress, amount){
    return {
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount
    }
}

function BlockTemplate(timestamp, transactions = [], previousHash = '') {
    return {
        timestamp: timestamp,
        transactions: transactions,
        previousHash: previousHash
    }
}

function mineBlock(difficulty, block) {
    let nonce = 0;
    let currentPowResult = calculateHash(block.previousHash + block.timestamp + JSON.stringify(block.mempool) + nonce);

    while (currentPowResult.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        console.log(`Nonce attempted: ${nonce}`);
        console.log(`Current POW result: ${currentPowResult}`);
        console.log(`Comparison: ${currentPowResult.substring(0, difficulty)} != ${Array(difficulty + 1).join("0")}`)
        nonce++;
        currentPowResult = calculateHash(block.previousHash + block.timestamp + JSON.stringify(block.mempool) + nonce);
    }
    console.log(`BLOCK MINED: ${currentPowResult}`);
    console.log(`Number of attempts: ${nonce + 1}`);
    return currentPowResult;
    }

function createGenesisBlock() {
    let blockTemplate = BlockTemplate(Date.parse("2019-01-01"), [], "0");
    blockTemplate.hash = mineBlock(0, blockTemplate);
    return blockTemplate;
}

function getLatestBlock(chain) {
    return chain[chain.length - 1];
}

function minePendingTransactions(miningRewardAddress, blockchain){
    console.log('\n Mining new block...');
    // console.log(blockchain.mempool);
    // console.log(getLatestBlock(blockchain.chain))
    let blockTemplate = BlockTemplate(Date.now(), blockchain.mempool, getLatestBlock(blockchain.chain).hash);
    
    blockTemplate.hash = mineBlock(blockchain.difficulty, blockTemplate);

    console.log('Block successfully mined!');
    blockchain.chain.push(blockTemplate);

    blockchain.mempool = [
        // console.log( Transaction(null, miningRewardAddress, blockchain.miningReward));
         Transaction(null, miningRewardAddress, blockchain.miningReward)
    ];
    console.log(blockchain.mempool[0])
}

function addToMempool(transaction, mempool){
    mempool.push(transaction);
}

function getBalanceOfAddress(address, blockchain){
    let balance = 0;

    for(const block of blockchain.chain){
        for(const trans of block.transactions){
            if(trans.fromAddress === address){
                balance -= trans.amount;
            }

            if(trans.toAddress === address){
                balance += trans.amount;
            }
        }
    }
    return balance;
}

function isPowValid(blockchain) {
    // [...Array(blockchain.chain.length)].map((_,i) => {
    //     const currentBlock = blockchain.chain[i];
    //     const previousBlock = blockchain.chain[i - 1];

    //     if (currentBlock.hash !== calculateHash(currentBlock)) {
    //         return false;
    //     }

    //     if (currentBlock.previousHash !== previousBlock.hash) {
    //         return false;
    //     }
    // })
    // return true
    for (let i = 1; i < blockchain.chain.length; i++){
        const currentBlock = blockchain.chain[i];
        const previousBlock = blockchain.chain[i - 1];

        if (currentBlock.hash !== currentBlock.calculateHash()) {
            return false;
        }

        if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
        }
    }

    return true;
}

function createBlockchain() {
    return {
        chain : [createGenesisBlock()],
        difficulty : 0,
        mempool : [],
        miningReward : 100
    }
}

const codeCoin = createBlockchain();
addToMempool(Transaction('address1', 'address2', 14400), codeCoin.mempool);
addToMempool(Transaction('address2', 'address1', 50), codeCoin.mempool);

minePendingTransactions('ariel-address', codeCoin);

console.log('\nBalance of Ariel is', getBalanceOfAddress('ariel-address', codeCoin));

// minePendingTransactions('ariel-address', codeCoin);
addToMempool(Transaction('address2', 'address1', 5220), codeCoin.mempool);
console.log('\nBalance of Ariel is', getBalanceOfAddress('ariel-address', codeCoin));

// minePendingTransactions('ariel-address', codeCoin);
console.log(codeCoin);

/*TODO:

Difficulty adjustment algorithm 
independent block pow validation (finish)
block ruleset validation (no inflation/doublespend)
pub/priv key transaction format? 
*/
