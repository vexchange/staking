import { useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import moment from 'moment'

import { Title } from '../../design'
import { useTransactions } from '../../context/transactions'

import PoolCard from '../PoolCard'

import { StakingPoolsContainer } from './styled'
import ApproveModal from './ApproveModal'
import ActionModal from '../ActionModal'
import ClaimModal from './ClaimModal'

const stakingPoolData = {
  claimableRbn: BigNumber.from('1'),
  claimHistory: [BigNumber.from(2)],
  unstakedBalance: BigNumber.from('3'),
  periodFinish: moment().add(4, 'days'),
  poolRewardForDuration: BigNumber.from('1'),
  poolSize: BigNumber.from('100000'),
  currentStake: BigNumber.from('100'),
}

const StakingPool = ({ vaultOption }) => {
  const { transactions } = useTransactions()

  const [isStakeAction, setIsStakeAction] = useState(true)
  const [modal, setModal] = useState(null)

  const ongoingTransaction = useMemo(() => {
    const ongoingTx = transactions.find(currentTx => ['stakingApproval', 'stake', 'unstake', 'rewardClaim'].includes(
      currentTx.type,
    ) && currentTx.stakeAsset === vaultOption && !currentTx.status)

    if (!ongoingTx) {
      return undefined
    }

    return ongoingTx.type
  }, [transactions, vaultOption])

  const showStakeModal = useMemo(() => {
    if (ongoingTransaction === 'stake') {
      /** Always show staking modal when there is ongoing transaction */
      return true
    } else if (ongoingTransaction === 'unstake') {
      /** Likewise with unstaking transaction */
      return false
    }

    return isStakeAction
  }, [isStakeAction, ongoingTransaction])

  return (
    <>
      <ApproveModal
        stake={showStakeModal}
        show={modal === 'approve'}
        onClose={() => setModal(null)}
        vaultOption={vaultOption}
        // logo={logo}
        stakingPoolData={stakingPoolData}
      />
      <ActionModal
        stake={showStakeModal}
        show={modal === 'approve'}
        onClose={() => setModal(null)}
        vaultOption={vaultOption}
        // logo={logo}
        stakingPoolData={stakingPoolData}
      />
      <ClaimModal
        show={modal === 'claim'}
        onClose={() => setModal(null)}
        vaultOption={vaultOption}
        // logo={logo}
        stakingPoolData={stakingPoolData}
      />
      <PoolCard
        active
        stakingPoolData={stakingPoolData}
        setModal={setModal}
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
      <StakingPool vaultOption="vex-vet" />
    </StakingPoolsContainer>
  )
}
