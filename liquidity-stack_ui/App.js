import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getProvider, getSigner } from "./utils/ethers";
import { getStakingContract, getTokenContract } from "./utils/contracts";

function App() {
    const [stakingContract, setStakingContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);
    const [ethAmount, setEthAmount] = useState("");
    const [stakedBalance, setStakedBalance] = useState("");
    const [account, setAccount] = useState("");

    // Function to connect the wallet
    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    useEffect(() => {
        if (account) {
            const initContracts = async () => {
                try {
                    const provider = getProvider();
                    const signer = getSigner();
                    const staking = getStakingContract(signer);
                    const token = getTokenContract(signer);
                    setStakingContract(staking);
                    setTokenContract(token);

                    // Fetch user's staked balance
                    const balance = await staking.stakedAmount(account);
                    setStakedBalance(ethers.utils.formatEther(balance));
                } catch (error) {
                    console.error("Error initializing contracts:", error);
                }
            };
            initContracts();
        }
    }, [account]);

    const handleDeposit = async () => {
        try {
            if (!stakingContract || !ethAmount) return;
            const tx = await stakingContract.deposit({
                value: ethers.utils.parseEther(ethAmount),
            });
            await tx.wait();
            alert("Deposit successful!");
            setEthAmount(""); // Clear the input after successful deposit
        } catch (error) {
            console.error("Error during deposit:", error);
            alert("Deposit failed.");
        }
    };

    const handleRedeem = async () => {
        try {
            if (!stakingContract || !ethAmount) return;
            const tx = await stakingContract.redeem(ethers.utils.parseEther(ethAmount));
            await tx.wait();
            alert("Redeem successful!");
            setEthAmount(""); // Clear the input after successful redeem
        } catch (error) {
            console.error("Error during redeem:", error);
            alert("Redeem failed.");
        }
    };

    return (
        <div style={{ backgroundColor: "#f3f7fa", height: "100vh", padding: "20px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Liquid Staking for DeFi</h1>
                {!account ? (
                    <button onClick={connectWallet} style={styles.connectButton}>
                        Connect Wallet
                    </button>
                ) : (
                    <p>Connected Account: {account}</p>
                )}
            </header>
            {account && (
                <div>
                    <p>Your Staked Balance: {stakedBalance} ETH</p>
                    <input
                        type="text"
                        value={ethAmount}
                        onChange={(e) => setEthAmount(e.target.value)}
                        placeholder="Amount in ETH"
                        style={{ marginRight: "10px" }}
                    />
                    <button onClick={handleDeposit} style={styles.button}>
                        Deposit ETH
                    </button>
                    <button onClick={handleRedeem} style={styles.button}>
                        Redeem ETH
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    connectButton: {
        backgroundColor: "#f89c1c",
        border: "none",
        color: "#fff",
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        borderRadius: "5px",
    },
    button: {
        margin: "10px",
        padding: "10px",
        backgroundColor: "#007bff",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        borderRadius: "5px",
    },
};

export default App;
