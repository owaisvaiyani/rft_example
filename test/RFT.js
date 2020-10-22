const {time} = require('@openzeppelin/test-helpers');
const RFT = artifacts.require('RFT.sol');
const NFT = artifacts.require('NFT.sol');
const DAI = artifacts.require('DAI.sol');

const DAI_AMOUNT = web3.utils.toWei('25000');
const SHARE_AMOUNT = web3.utils.toWei('25000');

contract('RFT', async addresses => {
    const [admin, buyer1, buyer2, buyer3, buyer4, _] = addresses;

    if('ICO should work', async() => {

        console.log(SHARE_AMOUNT)

        const dai = await DAI.new();
        const nft = await NFT.new('My nft', 'NFT');

        await nft.mint(admin, 1); // admin buys nft

        // mint mock dai for buyers
        await Promise.all([
            dai.mint(buyer1, DAI_AMOUNT),
            dai.mint(buyer2, DAI_AMOUNT),
            dai.mint(buyer3, DAI_AMOUNT),
            dai.mint(buyer4, DAI_AMOUNT),
        ]);

        const rft = await RFT.new('My rft', 'RFT', nft.addresses, 1, 1, web3.utils.toWei('100000'), dai.addresses);

        // dedicated transfer moves nft from admin to rft contract
        await nft.approve(rft.address, 1);

        await rft.startICO();

        // invest in ICO

        // buyer has to approve dai spending
        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer1});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer1});
        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer2});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer2});
        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer3});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer3});
        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer4});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer4});

        await time.increase(7 * 86400 + 1);
        await rft.withdrawProfits();

        const balanceShareBuyer1 = await rft.balanceOf(buyer1);
        const balanceShareBuyer2 = await rft.balanceOf(buyer2);
        const balanceShareBuyer3 = await rft.balanceOf(buyer3);
        const balanceShareBuyer4 = await rft.balanceOf(buyer4);

       assert(balanceShareBuyer1.toString() === SHARE_AMOUNT);
       assert(balanceShareBuyer2.toString() === SHARE_AMOUNT);
       assert(balanceShareBuyer3.toString() === SHARE_AMOUNT);
       assert(balanceShareBuyer4.toString() === SHARE_AMOUNT);


       const balanceAdminDai = await dai.balanceOf(admin)
       assert(balanceAdminDai.toString() === web3.utils.toWei('100000'));

    });
        


});