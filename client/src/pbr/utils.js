import BigNumber from 'bignumber.js'
// import { ethers } from 'ethers'
import axios from 'axios'
import config from '../config'
import { supportedPools, START_NEW_POOL_AT } from './lib/constants'
import { pbr, pbrAddress, pbrAddressMainnet } from '../constants/tokenAddresses'
import Web3 from 'web3'
import { createAwait } from 'typescript'
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const MaxUint256 = '999999999900000000000000000000000000000'

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export const getMasterChefAddress = (pbr) => {
  return pbr && pbr.masterChefAddress
}
export const getPolkaBridgeAddress = (pbr) => {
  return pbr && pbr.pbrAddress
}

export const getXPBRAddress = (pbr) => {
  return pbr && pbr.xPolkaBridgeAddress
}

export const getMasterChefContract = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.masterChef
}

export const getUniswapETHPBRPair = (pbr) => {

  return pbr && pbr.contracts && pbr.contracts.pools[0].lpContract
}
export const getLPAddress = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.pools[0].lpAddress
}
export const getWETHAddress = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.pools[0].token2Address
}
export const getPBRAddress = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.pools[0].tokenAddress
}

export const getPolkaBridgeContract = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.pbr
}
export const getXPolkaBridgeStakingContract = (pbr) => {
  return pbr && pbr.contracts && pbr.contracts.xPolkaBridgeStaking
}


export const getFarms = (pbr) => {
  return pbr
    ? pbr.contracts.pools.map(
      ({
        pid,
        name,
        symbol,
        icon,
        icon2,
        description,
        tokenAddress,
        tokenSymbol,
        token2Symbol,
        token2Address,
        symbolShort,
        tokenContract,
        token2Contract,
        isHot,
        isNew,
        isSoon,
        lpAddress,
        lpContract,
        protocal,
        iconProtocal,
        pairLink,
        addLiquidityLink,
        removeLiquidityLink,
        isActived,
        poolWeight
      }) => ({
        pid,
        id: symbol,
        name,
        lpToken: symbol,
        lpTokenAddress: lpAddress,
        lpContract,
        tokenAddress,
        token2Address,
        tokenSymbol,
        token2Symbol,
        token2Contract,
        symbol,
        symbolShort,
        isHot,
        isNew,
        isSoon,
        tokenContract,
        earnToken: 'PBR',
        earnTokenAddress: pbr.contracts.pbr.options.address,
        icon,
        icon2,
        description,
        protocal,
        iconProtocal,
        pairLink,
        addLiquidityLink,
        removeLiquidityLink,
        isActived,
        poolWeight: new BigNumber(poolWeight)
      }),
    )
    : []
}

export const getPoolWeight = async (masterChefContract, pid) => {
  const { allocPoint } = await masterChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await masterChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getEarned = async (masterChefContract, pid, account) => {
  return masterChefContract.methods.pendingReward(pid, account).call()
}

export const getTotalLocked = async (masterChefContract) => {
  return masterChefContract.methods.totalLock().call()
}



export const getTotalLockedValue = async (tokenContract, lpContract, pbrPrice) => {
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  const tokenAmountTotal = new BigNumber(tokenAmountWholeLP)
    .div(new BigNumber(10).pow(tokenDecimals))
  var usdValue = tokenAmountTotal.times(pbrPrice).times(2);
  return usdValue;
}



export const getLPValue = async (
  masterChefContract,
  lpContract,
  tokenAContract,
  tokenBContract,
  pid,
  pbrPrice,
  tokenASymbol,
  tokenBSymbol,
  isActived,
  poolWeight
) => {
  var usdtAddress;
  var usdcAddress;
  var daiAddress;
  var wethAddress;
  var finalpbrAddress;
  if (config.chainId == 1) {//mainnet{
    usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
    wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    finalpbrAddress = pbrAddressMainnet;
  }
  else {//rinkeby =4
    usdtAddress = '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02'
    usdcAddress = '0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b'
    daiAddress = '0xc7ad46e0b8a400bb3c915120d284aafba8fc4735';
    wethAddress = "0xc778417e063141139fce010982780140aa0cd5ab";
    finalpbrAddress = pbrAddress;
  }
  var tokenAmount = new BigNumber(0)
  var token2Amount = new BigNumber(0)
  var totalToken2Value = new BigNumber(0)
  var tokenPriceInToken2 = new BigNumber(0)
  var tokenAmountTotal = new BigNumber(0)
  var token2AmountTotal = new BigNumber(0)
  var usdValue = new BigNumber(0);
  var totalRewardsClaimed = new BigNumber(0);

  if (isActived == true) {


    // Get balance of the token address
    const balanceTokenA = await tokenAContract.methods
      .balanceOf(lpContract.options.address)
      .call()
    //console.log("balanceTokenA ", tokenASymbol, pid, balanceTokenA);

    const tokenADecimals = await tokenAContract.methods.decimals().call()
    // const balance = await lpContract.methods
    //   .balanceOf(masterChefContract.options.address)
    //   .call()

    const balanceTokenB = await tokenBContract.methods
      .balanceOf(lpContract.options.address)
      .call()
    //console.log("balanceTokenB ", tokenBSymbol, pid, balanceTokenB);

    const tokenBDecimals = await tokenBContract.methods.decimals().call()


    const totalSupplyLPToken = await lpContract.methods.totalSupply().call()
    var priceTokenA, priceTokenB;
    if (tokenBContract._address.toLowerCase() == usdtAddress
      || tokenBContract._address.toLowerCase() == usdcAddress
      || tokenBContract._address.toLowerCase() == daiAddress) {
      priceTokenB = 1;
    }
    else if (tokenBContract._address.toLowerCase() == wethAddress) {
      const { data } = await axios.get(config.coingecko + "/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false");
      priceTokenB = data.ethereum.usd;
    }
    else {
      priceTokenB = 1;
    }
    //console.log("priceTokenB ", tokenBSymbol, pid, priceTokenB)
    //price tokenA
    if (tokenAContract._address.toLowerCase() == finalpbrAddress) {
      priceTokenA = pbrPrice;
    }
    else {
      priceTokenA = new BigNumber(1);
    }
    //console.log("totalSupplyLPToken", pid, totalSupplyLPToken.toString());

    var lpValuce = (new BigNumber((new BigNumber(balanceTokenA).times(priceTokenA))).plus(
      (new BigNumber(new BigNumber(balanceTokenB).times(new BigNumber(priceTokenB)))))).dividedBy(new BigNumber(totalSupplyLPToken.toString()));
    //console.log("lpValuce", pid, lpValuce.toString());

    //total locked value=lpvalue*totalLPLockedPool
    var totalLpInFarmPool = await lpContract.methods.balanceOf(masterChefContract._address).call()
    //console.log("totalLpInFarmPool", pid, totalLpInFarmPool.toString());

    if (pid == 2)//usdc,usdt
    {
      usdValue = new BigNumber(totalLpInFarmPool).times(lpValuce).times(new BigNumber(1e12));
    }
    else {
      usdValue = new BigNumber(totalLpInFarmPool).times(lpValuce);
    }

    //console.log("usdValue", pid, usdValue.toString());


    var dataClaimed = await masterChefContract.methods.totalRewardClaimed(pid).call()
    totalRewardsClaimed = new BigNumber(dataClaimed)

  }

  var finaldata = {
    pid,
    tokenAmount,
    token2Amount,
    totalToken2Value,
    tokenPriceInToken2,
    usdValue,
    tokenAmountTotal,
    token2AmountTotal,
    poolWeight,
    totalRewardsClaimed
  }

  return finaldata

}


export const getPBRPrice = async (farms) => {

  if (!farms || !farms[0] || !farms[0].lpContract) {

    return new BigNumber(0);
  }

  const amountPBRInPool = await farms[0].tokenContract.methods
    .balanceOf(farms[0].lpTokenAddress)
    .call()
  //console.log("amountPBRInPool", amountPBRInPool);
  const amountETHInPool = await farms[0].token2Contract.methods
    .balanceOf(farms[0].lpTokenAddress)
    .call()
  // console.log("amountETHInPool", amountETHInPool);

  const { data } = await axios.get(config.coingecko + "/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false");
  var ethprice = 0;

  if (data) {
    ethprice = data.ethereum.usd;
  }
  return new BigNumber((new BigNumber(amountETHInPool).dividedBy(amountPBRInPool)).times(ethprice))



}


export const getLPTokenStaked = async (
  pbr,
  lpContract,
) => {
  var chef = getMasterChefContract(pbr)

  try {
    const balance = await lpContract.methods
      .balanceOf(chef.options.address)
      .call()
    return new BigNumber(balance)
  } catch (e) {
    return
  }
}

export const approve = async (lpContract, masterChefContract, account) => {
  return lpContract.methods
    .approve(masterChefContract.options.address, MaxUint256)
    .send({ from: account })
}

export const approveAddress = async (lpContract, address, account) => {
  return lpContract.methods
    .approve(address, MaxUint256)
    .send({ from: account })
}

export const checkPoolActive = async (pid) => {
  var p = supportedPools.find(e => e.pid === pid)
  if (p) {
    return p.isActived;

  }
  else {
    return false
  }

}

export const getNewRewardPerBlock = async (pbr, pid1 = 0) => {
  var chef = getMasterChefContract(pbr)
  try {
    const reward = await chef.methods
      .avgRewardPerBlock(pid1)
      .call()
    return new BigNumber(reward)
  } catch (e) {
    return
  }
}

export const stake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const harvest = async (masterChefContract, pid, account) => {
  return masterChefContract.methods
    .claimReward(pid)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (masterChefContract, pid, account) => {
  try {
    const { amountLP } = await masterChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amountLP)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (masterChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return masterChefContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}


export const getXPolkaBridgeSupply = async (pbr) => {
  return new BigNumber(await pbr.contracts.xPolkaBridgeStaking.methods.totalSupply().call())
}

export const getLockOf = async (pbr, account) => {
  var pbr = getPolkaBridgeContract(pbr)

  return new BigNumber(await pbr.methods.lockOf(account).call())
}

export const unlock = async (pbr, account) => {
  var pbr = getPolkaBridgeContract(pbr)
  return pbr.methods
    .unlock()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
export const enter = async (contract, amount, account) => {
  return contract.methods
    .enter(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}



export const leave = async (contract, amount, account) => {
  return contract.methods
    .leave(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
