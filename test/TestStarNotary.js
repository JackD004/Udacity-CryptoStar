const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let diffTokenId = 6;
    await instance.createStar('diff star', diffTokenId);

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let starName = await instance.name.call();
    assert.equal(starName, "Galaxy Token");
    let starSymbol = await instance.symbol.call();
    assert.equal(starSymbol, "GLX");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // 1. create 2 Stars with different tokenId
    let tokenId1 = 7;
    let tokenId2 = 8;
    let star1 = await instance.createStar('Star 1', tokenId1, {from: accounts[0]});
    let star2 = await instance.createStar('Star 2', tokenId2, {from: accounts[1]});

    let originalOwner1 = await instance.ownerOf(tokenId1); //Get original owner of token1
    let originalOwner2 = await instance.ownerOf(tokenId2); //Get original owner of token2

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);

    // 3. Verify that the owners changed
    let finalOwner1 = await instance.ownerOf(tokenId1); //Get final owner of token1
    let finalOwner2 = await instance.ownerOf(tokenId2); //Get final owner of token2
    assert.equal(finalOwner1, originalOwner2); //Verify final owners of
    assert.equal(finalOwner2, originalOwner1); //tokens have swapped.
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let tokenId = 9;
    await instance.createStar('New star', tokenId, {from: accounts[0]});
    let originalOwner = await instance.ownerOf(tokenId);

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], tokenId);

    // 3. Verify the star owner changed.
    let finalOwner = await instance.ownerOf(tokenId);
    assert.equal(finalOwner, accounts[1]);
    assert(finalOwner !== originalOwner, 'Final owner cannot be original owner!');

});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let tokenId = 10;
    await instance.createStar('New star name', tokenId, {from: accounts[0]});

    // 2. Call your method lookUptokenIdToStarInfo
    let newStarName = await instance.lookUptokenIdToStarInfo(tokenId);

    // 3. Verify if you Star name is the same
    assert.equal(newStarName, 'New star name');
});