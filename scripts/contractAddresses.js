async function main() {
    const [address] = await ethers.provider.listAccounts();
    const nonce = await ethers.provider.getTransactionCount(address);
    for(let i = 0; i < 4; i++) {
        const contractAddress = ethers.utils.getContractAddress({
            from: address,
            nonce: nonce + i
        }) 

        console.log(`address ${i}: `, contractAddress);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
