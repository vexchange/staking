import { useCallback, useState, useMemo } from 'react'
import { find } from 'lodash'

import { formatBigNumber } from '../../utils'
import MultiRewards from '../../constants/abis/MultiRewards.js'
import { useTransactions } from '../../context/transactions'
import { useAppContext } from '../../context/app'

import { BaseModalContentColumn, BaseUnderlineLink, SecondaryText } from '../../design'
import colors from '../../design/colors'

import { ActionButton } from '../Button'
import VEXClaimModalContent from '../VEXModalClaimContent'
import Modal from '../Modal'
import Logo from '../Logo'
import { ExternalIcon } from '../Icons'

import {
  AssetTitle,
  InfoColumn,
  InfoData,
  LogoContainer,
} from './styled'
import { ethers } from 'ethers'

export default function ClaimModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions()
  const { connex, rewardsContract, ticker } = useAppContext()
  const [step, setStep] = useState('info')

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'claim' || step === 'claimed') {
      setStep('info')
    }
  }, [onClose, step])

  const handleClaim = useCallback(async () => {
    setStep('claim')

    const getRewardABI = find(MultiRewards, { name: 'getReward' })
    const method = rewardsContract.method(getRewardABI)
    const clause = method.asClause()

    try {
      const response = await connex.vendor
                    .sign('tx', [clause])
                    .comment(`Claim ${ethers.utils.formatEther(stakingPoolData.userData.claimableVex)} VEX`)
                    .request()

      setStep('claiming')

      const txhash = response.txid

      addTransaction({
        txhash,
        type: 'rewardClaim',
        amount: ethers.utils.formatEther(stakingPoolData.userData.claimableVex),
        stakeAsset: vaultOption,
      })

      const txVisitor = connex.thor.transaction(txhash)
      let txReceipt = null
      while (!txReceipt) {
        await ticker.next()
        txReceipt = await txVisitor.getReceipt()
      }

      setStep('claimed')
    } catch (err) {
      console.error('error',err)
      setStep('info')
    }
  }, [
    addTransaction,
    connex,
    stakingPoolData,
    vaultOption,
  ])

  const body = useMemo(() => {
    const color = colors.orange
    switch (step) {
      case 'info':
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color="white">
                <Logo />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str="vex-vet">vex-vet</AssetTitle>
            </BaseModalContentColumn>
            <InfoColumn marginTop={40}>
              <SecondaryText>Unclaimed $VEX</SecondaryText>
              <InfoData>
                {formatBigNumber(stakingPoolData.userData.claimableVex)}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <div className="d-flex align-items-center">
                <SecondaryText>Pool rewards</SecondaryText>
              </div>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolData.poolRewardForDuration)} VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <BaseUnderlineLink
                href="https://medium.com/@vexchange/vex-launch-information-9e14b9da4b64"
                target="_blank"
                rel="noreferrer noopener"
                className="d-flex align-items-center"
              >
                <>
                  <SecondaryText>Read about $VEX</SecondaryText>
                  <ExternalIcon className="ml-1" />
                </>
              </BaseUnderlineLink>
            </BaseModalContentColumn>
            <BaseModalContentColumn>
              <ActionButton
                className="btn py-3 mb-2"
                onClick={handleClaim}
                color={color}
                disabled={stakingPoolData.userData.claimableVex.isZero()}
              >
                {"Claim"}
              </ActionButton>
            </BaseModalContentColumn>
          </>
        )
      default:
        return <VEXClaimModalContent step={step} />
    }
  }, [
    step,
    vaultOption,
    stakingPoolData,
    handleClaim,
  ])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={450}
    >
      {body}
    </Modal>
  )
}
