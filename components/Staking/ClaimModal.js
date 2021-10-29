import { useCallback, useState, useMemo } from 'react'
import moment from 'moment'
import { find } from 'lodash'
import { BigNumber } from 'ethers'

import { formatBigNumber } from '../../utils'

import { REWARDS_ADDRESSES } from '../../constants/'
import MultiRewards from '../../constants/abis/MultiRewards.json'
import { useTransactions } from '../../context/transactions'
import { useAppContext } from '../../context/app'

import { BaseModalContentColumn, BaseUnderlineLink, SecondaryText } from '../../design'
import colors from '../../design/colors'

import { ActionButton } from '../Button'
import VEXClaimModalContent from '../VEXModalClaimContent'
import ModalContentExtra from '../ModalContentExtra'
import Modal from '../Modal'
import Logo from '../Logo'
import { ExternalIcon } from '../Icons'

import {
  AssetTitle,
  InfoColumn,
  InfoData,
  LogoContainer,
  WarningText,
} from './styled'
import { ethers } from 'ethers'

export default function ClaimModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions()
  const { connex } = useAppContext()
  const [step, setStep] = useState('info')

  const exitABI = find(MultiRewards.abi, { name: 'exit' })
  const method = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(exitABI)
  const clause = method?.asClause()

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'claim' || step === 'claimed') {
      setStep('info')
    }
  }, [onClose, step])

  const handleClaim = useCallback(async () => {
    setStep('claim')

    try {
      const response = await connex.vendor
        .sign('tx', [{ ...clause }])
        .comment(`Claim ${ethers.utils.formatEther(stakingPoolData.claimableVex)}`)
        .request()

      setStep('claiming')

      const txhash = response.txid

      addTransaction({
        txhash,
        type: 'rewardClaim',
        amount: ethers.utils.formatEther(stakingPoolData.claimableVex),
        stakeAsset: vaultOption,
      })

      const txVisitor = connex.thor.transaction(txhash)
      const ticker = connex.thor.ticker()
      let txReceipt = null
      while (!txReceipt) {
        await ticker.next()
        txReceipt = await txVisitor.getReceipt()
      }
      setStep('claimed')
    } catch (err) {
      console.log('error')
      setStep('info')
    }
  }, [
    addTransaction,
    connex,
    clause,
    stakingPoolData,
    vaultOption,
  ])

  const body = useMemo(() => {
    const color = colors.orange

    console.log('claim modal: ', step)
    switch (step) {
      case 'info':
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color={color}>
                <Logo />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str="vex-vet">vex-vet</AssetTitle>
            </BaseModalContentColumn>
            <InfoColumn marginTop={40}>
              <SecondaryText>Unclaimed $VEX</SecondaryText>
              <InfoData>
                {ethers.utils.formatEther(stakingPoolData.claimableVex)}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Claimed $VEX</SecondaryText>
              <InfoData>
                {formatBigNumber(BigNumber.from('22'))}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <div className="d-flex align-items-center">
                <SecondaryText>Pool rewards</SecondaryText>
              </div>
              <InfoData>
                {ethers.utils.formatEther(stakingPoolData.poolRewardForDuration)} VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <BaseUnderlineLink
                href="https://ribbonfinance.medium.com/rbn-airdrop-distribution-70b6cb0b870c"
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
                disabled={stakingPoolData.claimableVex.isZero()}
              >
                {"Unstake & Claim"}
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
      height={580}
    >
      {body}
    </Modal>
  )
}
