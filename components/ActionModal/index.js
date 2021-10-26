import {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import moment from 'moment'
import { ethers } from 'ethers'

import { formatBigNumber, getExploreURI } from '../../utils'

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'

import colors from '../../design/colors'

import {
  BaseModalContentColumn,
  BaseInput,
  BaseInputButton,
  BaseInputLabel,
  BaseInputContainer,
  BaseUnderlineLink,
  SecondaryText,
  LogoContainer,
  Title,
  FloatingContainer,
  PrimaryText,
} from '../../design'

import TrafficLight from '../TrafficLight'
import { ActionButton } from '../Button'
import Modal from '../Modal'
import Logo from '../Logo'

import {
  Arrow,
  AssetTitle,
  CurrentStakeTitle,
  InfoColumn,
  InfoData,
  ModalTitle,
} from './styled'

const ActionModal = ({
  stake,
  show,
  onClose,
  stakingPoolData,
  vaultOption,
  stakingReward,
}) => {
  const { addTransaction } = useTransactions()
  const { connex } = useAppContext()
  const [txId, setTxId] = useState('')
  const [step, setStep] = useState('warning')
  const [input, setInput] = useState('')
  const [error, setError] = useState()

  const color = '#e79631'

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'form' || step === 'preview' || step === 'walletAction') {
      setStep('warning')
    }
    if (step !== 'processing') {
      setInput('')
    }
  }, [step, onClose])

  const handleActionPressed = useCallback(async () => {
    if (!stakingReward) {
      return
    }
    setStep('walletAction')

    try {
      const tx = stake
        ? await stakingReward.stake(ethers.utils.parseUnits(input, 18))
        : await stakingReward.withdraw(ethers.utils.parseUnits(input, 18))

      setStep('processing')

      const txhash = tx.hash

      setTxId(txhash)
      addTransaction({
        txhash,
        type: stake ? 'stake' : 'unstake',
        amount: input,
        stakeAsset: vaultOption,
      })

      await connex.waitForTransaction(txhash, 5)
      setStep('warning')
      setTxId('')
      setInput('')
      onClose()
    } catch (err) {
      setStep('preview')
    }
  }, [
    addTransaction,
    input,
    connex,
    stakingReward,
    onClose,
    vaultOption,
    stake,
  ])

  const handleInputChange = useCallback(e => {
    const rawInput = e.target.value

    if (rawInput && parseFloat(rawInput) < 0) {
      setInput('')
      return
    }

    setInput(rawInput)
  }, [])

  const handleMaxPressed = useCallback(() => (stake
    ? setInput(formatUnits(stakingPoolData.unstakedBalance, 18))
    : setInput(formatUnits(stakingPoolData.currentStake, 18))),
  [stake, stakingPoolData])

  useEffect(() => {
    setError(undefined)

    /** Skip when there is no input */
    if (!input) {
      return
    }

    /** Check sufficient balance for deposit */
    if (
      stake &&
      !stakingPoolData.unstakedBalance.gte(
        BigNumber.from(ethers.utils.parseUnits(input, 18)),
      )
    ) {
      setError('insufficient_balance')
    } else if (
      !stake &&
      !stakingPoolData.currentStake.gte(
        BigNumber.from(ethers.utils.parseUnits(input, 18)),
      )
    ) {
      setError('insufficient_staked')
    }
  }, [input, stake, stakingPoolData])

  const renderActionButtonText = useCallback(() => {
    switch (error) {
      case 'insufficient_balance':
        return 'INSUFFICIENT BALANCE'
      case 'insufficient_staked':
        return 'INSUFFICIENT STAKED BALANCE'
      default:
        return stake ? 'STAKE PREVIEW' : 'UNSTAKE PREVIEW'
    }
  }, [stake, error])

  const body = useMemo(() => {
    switch (step) {
      case 'warning':
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color={colors.red}>!</LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={16}>
              <AssetTitle str="WARNING">WARNING</AssetTitle>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={16}>
              <SecondaryText className="text-center">
                Your VEX rewards will be forfeited if you unstake your tokens
                before the end of the program (
                {moment(stakingPoolData.periodFinish, 'X').format('MMM Do, YYYY')}
                ).
              </SecondaryText>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop="auto">
              <ActionButton
                error
                className="btn py-3 mb-3"
                color={color}
                disabled={false}
                onClick={() => setStep('form')}
              >
                Continue
              </ActionButton>
            </BaseModalContentColumn>
          </>
        )
      case 'form':
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color={color}>
                <Logo />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str={vaultOption}>{vaultOption}</AssetTitle>
            </BaseModalContentColumn>
            <BaseModalContentColumn>
              <div className="d-flex w-100 flex-wrap">
                <BaseInputLabel>
                  AMOUNT (
                  {vaultOption}
                  )
                </BaseInputLabel>
                <BaseInputContainer className="position-relative">
                  <BaseInput
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={input}
                    onChange={handleInputChange}
                  />
                  <BaseInputButton onClick={handleMaxPressed}>
                    MAX
                  </BaseInputButton>
                </BaseInputContainer>
              </div>
            </BaseModalContentColumn>
            {stake ? (
              <InfoColumn>
                <SecondaryText>Unstaked Balance</SecondaryText>
                <InfoData error={Boolean(error)}>
                  {formatBigNumber(stakingPoolData.unstakedBalance, 18)}
                </InfoData>
              </InfoColumn>
            ) : (
              <InfoColumn>
                <SecondaryText>Your Current Stake</SecondaryText>
                <InfoData error={Boolean(error)}>
                  {formatBigNumber(stakingPoolData.currentStake, 18)}
                </InfoData>
              </InfoColumn>
            )}
            <InfoColumn>
              <SecondaryText>Pool Size</SecondaryText>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolSize, 18)}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <div className="d-flex align-items-center">
                <SecondaryText>Pool rewards</SecondaryText>
              </div>
              <InfoData>
                {formatBigNumber(stakingPoolData.poolRewardForDuration, 18)}
                {' '}
                VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <ActionButton
                className="btn py-3"
                color={color}
                error={Boolean(error)}
                disabled={
                  Boolean(error) || !(Boolean(input) && parseFloat(input) > 0)
                }
                onClick={() => setStep('preview')}
              >
                {renderActionButtonText()}
              </ActionButton>
            </BaseModalContentColumn>
            {stake ? (
              <BaseModalContentColumn marginTop={16} className="mb-2">
                <CurrentStakeTitle>
                  Your Current Stake:
                  {' '}
                  {formatBigNumber(stakingPoolData.currentStake, 18)}
                </CurrentStakeTitle>
              </BaseModalContentColumn>
            ) : (
              <BaseModalContentColumn marginTop={16} className="mb-2">
                <CurrentStakeTitle>
                  Unstaked Balance:
                  {' '}
                  {formatBigNumber(stakingPoolData.unstakedBalance, 18)}
                </CurrentStakeTitle>
              </BaseModalContentColumn>
            )}
          </>
        )
      case 'preview':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <ModalTitle>
                {stake ? 'STAKE' : 'UNSTAKE'}
                {' '}
                PREVIEW
              </ModalTitle>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={48}>
              <BaseInputLabel>
                AMOUNT
                {' '}
                (
                {vaultOption}
                )
              </BaseInputLabel>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={4}>
              <Title fontSize={40} lineHeight={52}>
                {parseFloat(parseFloat(input).toFixed(4))}
              </Title>
            </BaseModalContentColumn>
            <InfoColumn>
              <SecondaryText>Pool</SecondaryText>
              <InfoData>{vaultOption}</InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Your Stake</SecondaryText>
              <InfoData>
                {ethers.utils.formatEther(stakingPoolData.currentStake)}
                <Arrow className="fas fa-arrow-right mx-2" color={color} />
                {ethers.utils.formatEther(
                  stake
                    ? stakingPoolData.currentStake.add(
                      BigNumber.from(ethers.utils.parseUnits(input, 18)),
                    )
                    : stakingPoolData.currentStake.sub(
                      BigNumber.from(ethers.utils.parseUnits(input, 18)),
                    ),
                )}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Pool rewards</SecondaryText>
              <InfoData>
                {ethers.utils.formatEther(stakingPoolData.poolRewardForDuration)}
                {' '}
                VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <ActionButton
                className="btn py-3 mb-2"
                onClick={handleActionPressed}
                color={color}
              >
                {stake ? 'STAKE' : 'UNSTAKE'}
                {' '}
                NOW
              </ActionButton>
            </BaseModalContentColumn>
          </>
        )
      case 'walletAction':
      case 'processing':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <ModalTitle>
                {step === 'walletAction'
                  ? 'CONFIRM Transaction'
                  : 'TRANSACTION PENDING'}
              </ModalTitle>
            </BaseModalContentColumn>
            <FloatingContainer>
              <TrafficLight active={step === 'processing'} />
            </FloatingContainer>
            {step === 'walletAction' ? (
              <BaseModalContentColumn marginTop="auto">
                <PrimaryText className="mb-2">
                  Confirm this transaction in your wallet
                </PrimaryText>
              </BaseModalContentColumn>
            ) : (
              <BaseModalContentColumn marginTop="auto">
                <BaseUnderlineLink
                  to={`${getExploreURI()}/tx/${txId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="d-flex"
                >
                  <PrimaryText className="mb-2">View on Explore</PrimaryText>
                </BaseUnderlineLink>
              </BaseModalContentColumn>
            )}
          </>
        )
      default:
        return <div>ken</div>
    }
  }, [
    color,
    stake,
    error,
    handleInputChange,
    handleMaxPressed,
    handleActionPressed,
    input,
    step,
    txId,
    vaultOption,
    stakingPoolData,
    renderActionButtonText,
  ])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={step === 'form' ? 564 : 424}
      backButton={
        step === 'preview' ? { onClick: () => setStep('form') } : undefined
      }
      headerBackground={step !== 'warning' && step !== 'form'}
    >
      {body}
    </Modal>
  )
}

export default ActionModal
