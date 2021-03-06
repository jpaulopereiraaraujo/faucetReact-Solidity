import { useEffect, useState, useCallback } from "react";
import "./App.css"
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import {loadContract} from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState ({
    provider:null,
    web3:null,
    contract:null
  })
  
  const[balance, setBalance]  = useState(null)
  const[account, setAccount] = useState(null)
  const [shouldReload, reload] = useState(false)

  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload])

  const setAccountListener =provider => {
    provider.on("accountsChanged", accounts => setAccount(accounts[0]))
  }

  useEffect(() => {
      
    const loadProvider = async () => {
        //O primeiro if é para sistemas atualizados
        const provider = await detectEthereumProvider();
        const contract = await loadContract("Faucet", provider);
        
        if(provider){
          setAccountListener(provider)
          setWeb3Api({
            web3: new Web3(provider),
            provider,
            contract
          })

        } else {
          console.logerror("Please, install metamask.")
        }

      }
        

      loadProvider()
    }, [])

  
    useEffect (() => {
      const getAccount = async () => {
        
        const accounts = await web3Api.web3.eth.getAccounts()
        setAccount(accounts[0])
      }

      web3Api.web3 && getAccount()

    }, [web3Api.web3])

    useEffect(() => {

        const loadBalance = async () => {
        const { contract, web3 } = web3Api
        const balance = await web3.eth.getBalance(contract.address)
        // converte de wei para ether
        setBalance(web3.utils.fromWei(balance,"ether"))

      }


      web3Api.contract && loadBalance()
    },[web3Api, shouldReload])
    
    const addFunds = useCallback(async () => {
      const { contract, web3 } = web3Api
      await contract.addFunds({
        from: account,
        value: web3.utils.toWei("1", "ether")
      })

      // 
      reloadEffect()
    }, [web3Api,account, reloadEffect])

    const withdrawFunds = async () => {
      const { contract, web3 } = web3Api
      const withdrawAmount = web3.utils.toWei("0.1", "ether")
      await contract.withdraw( withdrawAmount, {
        from: account
         
      })
      reloadEffect()

    }

  
  return (

  
    <>

    <div className="faucet-wrapper">
      <div className="faucet">
        <div className="is-flex is-align-items-center">
        <span>
            <strong className ="mr-2"> Account: </strong>
        </span>
          {account ? 
          account: 
          <button
            className="button is-info mr-2"
            onClick={() => web3Api.provider.request({method:"eth_requestAccounts"})}
          > 
            Connect Wallet
          </button>
          
          }
        </div>
        <div className="balance-view is-size-2 my-5">
          Current Balance: <strong>{balance}</strong> ETH
        </div>
       
        <button 
        disabled ={!account}
        onClick = {addFunds}
        className="button is-primary mr-2">
          Donate 1eth
          </button>
        <button
        disabled ={!account}
        onClick = {withdrawFunds}
        className="button is-link">
          Withdraw 0.1eth
          </button>
      </div>
    </div>
    
    </>
  );
}

export default App;
