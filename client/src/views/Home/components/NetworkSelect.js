import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import {
  bscNetworkDetail,
  ethereumNetworkDetail,
} from '../../../pbr/lib/networkConstants'
// import { setupNetwork } from '../../../pbr/utils'
import config from '../../../config'
import useNetwork from '../../../hooks/useNetwork'
import { useWallet } from 'use-wallet'
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  imgIcon: {
    marginLeft: 10,
    height: 23,
  },
  buttonDrop: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'black',
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'grey',
      color: '#100525'
    },
  },
  main: {
    color: 'white',
    backgroundColor: '#100525',
    border: '1px solid white',
    borderRadius: 60,
    paddingLeft: 10,
  },
}))


export default function NetworkSelect({}) {
  const classes = useStyles()

  const { chainId, status } = useNetwork()
  const { account } = useWallet()

  const testing = false

  const currentConnection = testing ? 'testnet' : 'mainnet'

  useEffect(() => {
    // console.log('selected chain id', selectedNetwork)
    if (!account) {
      return
    }
    if (status === 'connected') {
      handleChange(chainId)
    }
  }, [chainId, status])

  const handleChange = (_selected) => {
    if ([config.bscChain, config.bscChainTestent].includes(_selected)) {
      setupNetwork(
        currentConnection === 'mainnet'
          ? bscNetworkDetail.mainnet
          : bscNetworkDetail.testnet,
      )
    } else {
      setupNetwork(
        currentConnection === 'mainnet'
          ? ethereumNetworkDetail.mainnet
          : ethereumNetworkDetail.testnet,
      )
    }
  }

  const setupNetwork = async (networkObject) => {
    const provider = window.ethereum
    if (provider) {
      // const _chainId = parseInt(networkObject.chainId, 10)
      try {
        if (
          networkObject.chainId === `0x${config.chainId.toString(16)}` ||
          networkObject.chainId === `0x${config.chainIdTestnet.toString(16)}`
        ) {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkObject.chainId }],
          })
        }
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkObject],
        })
        return true
      } catch (error) {
        console.error('Failed to setup the network in Metamask:', error)
        return false
      }
    } else {
      console.error(
        "Can't setup the BSC network on metamask because window.ethereum is undefined",
      )
      return false
    }
  }
  return (
    <div>
      <FormControl variant="standard" className={classes.root}>
        {console.log('testConnect: ', chainId)}
        <Select
          className={classes.main}
          value={chainId}
          onChange={({ target: { value } }) => handleChange(value)}
          disableUnderline
        >
          <MenuItem
            value={
              currentConnection === 'testnet'
                ? config.chainIdTestnet
                : config.chainId
            }
            className={classes.buttonDrop}
          >
            <span>Ethereum</span>
            <img className={classes.imgIcon} src="/img/tokens/eth.png" />
          </MenuItem>
          <MenuItem
            value={
              currentConnection === 'testnet'
                ? config.bscChainTestent
                : config.bscChain
            }
            className={classes.buttonDrop}
          >
            <span>Binance Smart Chain</span>
            <img className={classes.imgIcon} src="/img/tokens/bnb.png" />
          </MenuItem>
          {/* <MenuItem value={currentConnection === 'testnet' ? config.polygon_chain_testnet : config.polygon_chain_mainnet} className={classes.buttonDrop}>
            <span>Polygon</span>
            <img className={classes.imgIcon} src="/img/tokens/polygon.png" />
          </MenuItem> */}
          {/* <MenuItem value={currentConnection === 'testnet' ? config.hmyChainTestnet : config.hmyChainMainnet} className={classes.buttonDrop}>
            <span>Harmony</span>
            <img className={classes.imgIcon} src="/img/tokens/one.png" />
          </MenuItem> */}
        </Select>
      </FormControl>
    </div>
  )
}