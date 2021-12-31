async function main() {
  const Seed = await ethers.getContractFactory("Seed");
  seed = await Seed.deploy();
  await seed.deployed();
  
  console.log("Seed deployed", seed.address);
  
  const YieldFarm = await ethers.getContractFactory("YieldFarm");
  yieldFarm = await YieldFarm.deploy();
  await yieldFarm.deployed();
  
  console.log("Yield Farm deployed", yieldFarm.address);
  
  const Proxy = await ethers.getContractFactory("Proxy");
  proxy = await Proxy.deploy(yieldFarm.address);
  await proxy.deployed();

  console.log("Proxy deployed", proxy.address);
  
  const Potato = await ethers.getContractFactory("Potato");
  potato = await Potato.deploy(proxy.address);
  await potato.deployed();

  console.log("Potato deployed", potato.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
