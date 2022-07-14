Mint = {
    web3: null,
    web3Provider: null,
    mfersAddr: "0x946AD54E639f5d85F49DC1962e91cFA8eadDD74e",
    mfers3DAddr: "0x954118d0AeCB0F8170Aded74751FC7f74e0ef1Df",
    contracts: {},
    accounts: [],

    init: async ()=>{
        if(window.ethereum){
            // Web3 instance already provided by metamask
            Mint.web3Provider =  window.ethereum;
            Mint.web3 = new Web3(Mint.web3Provider);

           
            let accounts = await Mint.initAccount();
            if(accounts){
                Mint.accounts = accounts;
                console.log(Mint.accounts)
                return Mint.initContract();
            }else{
                // return Mint.initContract();
            }
            
        }else{
            alert("Please use browser with metamask installed");
            return;
        }
    },

    initAccount: async ()=>{
        let accounts =  await Mint.web3.eth.getCoinbase();
        if(accounts){
            $('#address-btn').html(truncateEthAddress(accounts));
            $('#address-btn').css("background-color","#F7A62D");
            $('#wallet-btn2').hide();
            return accounts;
        }else{
            return false;
        }
    },

    connect: async ()=>{
        if(Mint.accounts != []){  
            if(Mint.web3Provider){
                try{ 
                    await Mint.web3Provider.request({method: "eth_requestAccounts"});
                    let accounts = Mint.initAccount();
                    if(accounts){
                        // Mint.accounts = accounts;
                        window.location.reload(true)
                    }else{
                        console.log("something wrong")
                    }
                } catch(err){
                    console.log(err)
                }
            }else{
                alert("Please use browser with metamask installed");
                return;
            }
          }
          else{
              console.log("Already connected")
              return;
          }
    },

    initContract: async ()=>{
       let IERC721 = await $.getJSON("./abis/IERC721.json");
       Mint.contracts.mfers = TruffleContract(IERC721);
       Mint.contracts.mfers.setProvider(Mint.web3Provider);
       let contracti = await Mint.contracts.mfers.at(Mint.mfersAddr);
       let balance = await contracti.balanceOf(Mint.accounts)
       balance >=1 ? Mint.Whitelisted() : alert("You do not own mfers for presale mint");

    //init mfers3D
       if(Mint.mfers3DAddr != ""){
            let Mfers3D = await $.getJSON("./abis/Mfers3D.json");
            Mint.contracts.Mfers3D = TruffleContract(Mfers3D);
            Mint.contracts.Mfers3D.setProvider(Mint.web3Provider);
            let contracti = await Mint.contracts.Mfers3D.at(Mint.mfers3DAddr);
            let supply = await contracti.totalMinted();
            $('#supply').html(supply.toString()+"/10000")
       }else{
            return;
       }     
    },

    Whitelisted: ()=>{
        $('.mint-btn').show();
    },

    mint: async ()=>{

        let contracti = await Mint.contracts.Mfers3D.at(Mint.mfers3DAddr);
        let qty = $('#qty').html();
        let cost = Mint.web3.utils.toWei("0.025","ether") * qty;
        let obj = {
            from:Mint.accounts,
            value:cost,
            gas: 5000000
        };
        console.log(obj)
        console.log(Mint.web3.version)
        try{
            await contracti.mint(qty,obj);
        }catch(e){
            console.log(e.message)
        }
        
    }



}

$(function(){
    $(window).load(function(){
        Mint.init();
    })
})