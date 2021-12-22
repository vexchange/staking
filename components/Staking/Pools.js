import { useState } from "react";

import { useStakingPoolsData } from "../../context/data";
import { Title } from "../../design";

import PoolCard from "../PoolCard";

import { StakingPoolsContainer } from "./styled";
import ApproveModal from "./ApproveModal";
import ActionModal from "../ActionModal";
import ClaimModal from "./ClaimModal";
import { STAKING_POOLS } from "../../constants";
import { isArray } from "lodash";

const StakingPool = ({ vaultOption }) => {
  const { stakingPoolsData } = useStakingPoolsData();
  let stakingPoolData = {};

  Object.keys(stakingPoolsData).map((key) => {
    if (isArray(stakingPoolsData[key])) {
      stakingPoolData[key] = stakingPoolsData[key].filter((stakingPool) => {
        return stakingPool.poolId === vaultOption.id;
      })[0];
    } else {
      stakingPoolData[key] = stakingPoolsData[key]
    }
  });

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isStakeAction, setIsStakeAction] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  return (
    <>
      <ApproveModal
        show={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        vaultOption={vaultOption}
        stakingPoolData={stakingPoolData}
      />
      <ActionModal
        show={showActionModal}
        stake={isStakeAction}
        onClose={() => setShowActionModal(false)}
        vaultOption={vaultOption}
        stakingPoolData={stakingPoolData}
      />
      <ClaimModal
        show={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        vaultOption={vaultOption}
        stakingPoolData={stakingPoolData}
      />
      <PoolCard
        stakingPoolData={stakingPoolData}
        vaultOption={vaultOption}
        setShowApprovalModal={setShowApprovalModal}
        setShowClaimModal={setShowClaimModal}
        setShowActionModal={setShowActionModal}
        setIsStakeAction={setIsStakeAction}
      />
    </>
  );
};

export default function Pools() {
  return (
    <StakingPoolsContainer>
      <Title
        fontSize={18}
        lineHeight={24}
        className="mb-4 w-100"
        style={{
          textTransform: "uppercase",
        }}
      >
        Staking Pools
      </Title>
      {STAKING_POOLS.map((stakingPool) => (
        <StakingPool key={stakingPool.id} vaultOption={stakingPool} />
      ))}
    </StakingPoolsContainer>
  );
}
