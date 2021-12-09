import { useMemo, useState } from 'react'

import { useStakingPoolData } from '../../context/data'
import { Title } from '../../design'
import { useTransactions } from '../../context/transactions'

import PoolCard from '../PoolCard'

import { StakingPoolsContainer } from './styled'
import ApproveModal from './ApproveModal'
import ActionModal from '../ActionModal'
import ClaimModal from './ClaimModal'
import { STAKING_POOLS } from '../../constants'

const StakingPool = ({ vaultOption }) => {
  const { transactions } = useTransactions()
  const { stakingPoolData } = useStakingPoolData(vaultOption)

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [isStakeAction, setIsStakeAction] = useState(true)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)

  const ongoingTransaction = useMemo(() => {
    const ongoingTx = (transactions || []).find(currentTx => [
      'stakingApproval',
      'stake',
      'unstake',
      'rewardClaim',
    ].includes(
      currentTx.type,
    ) && currentTx.stakeAsset === vaultOption.stakeAsset && !currentTx.status)

    if (!ongoingTx) {
      return undefined
    }

    return ongoingTx.type
  }, [transactions, vaultOption])

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
  )
}

export default function Pools() {
  return (
    <StakingPoolsContainer>
      <Title
        fontSize={18}
        lineHeight={24}
        className="mb-4 w-100"
        style={{
          textTransform: 'uppercase',
        }}
      >
        Staking Pools
      </Title>
      {
        STAKING_POOLS.map((stakingPool) => {
          return <StakingPool key={stakingPool.stakeAsset} vaultOption={stakingPool} />
        })
      }
    </StakingPoolsContainer>
  )
}
