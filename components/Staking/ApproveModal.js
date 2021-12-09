import { useCallback, useState, useMemo } from 'react'
import { find } from 'lodash'
import { BigNumber, constants, utils } from 'ethers'

import IERC20 from '../../constants/abis/IERC20.js'
import { getExploreURI } from '../../utils'

import {
  BaseModalContentColumn,
  BaseUnderlineLink,
  FloatingContainer,
  PrimaryText,
  Title,
} from '../../design'
import TrafficLight from "../TrafficLight";

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'

import Modal from '../Modal'
import ApproveModalInfo from '../ApproveModalInfo'
import {REWARDS_ADDRESSES, VECHAIN_NODE} from "../../constants";

export default function ApproveModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions()
  const { connex, account, stakingTokenContract, ticker } = useAppContext()
  const [step, setStep] = useState('info')
  const [txId, setTxId] = useState('');

  const handleApprove = useCallback(async () => {
    if (!stakingTokenContract) {
      return
    }

    const approveABI = find(IERC20, { name: 'approve' })
    const method = stakingTokenContract.method(approveABI)
    const clause = method.asClause(REWARDS_ADDRESSES[VECHAIN_NODE], constants.MaxUint256)

    setStep('approve')

    try {
      const response = await connex.vendor
        .sign('tx', [clause])
        .signer(account) // This modifier really necessary?
        .comment('Sign to approve spending of your LP tokens')
        .request()

      const txhash = response.txid

      setStep('approving')
      setTxId(txhash)

      addTransaction({
        txhash,
        type: 'stakingApproval',
        stakeAsset: vaultOption.stakeAsset,
      })

      const txVisitor = connex.thor.transaction(txhash)
      let txReceipt = null
      while (!txReceipt) {
        await ticker.next()
        txReceipt = await txVisitor.getReceipt()
      }
      setStep('info')
      setTxId('')
      onClose()
    } catch (err) {
      console.error(err)
      setStep('info')
    }
  }, [
    find,
    REWARDS_ADDRESSES,
    IERC20,
    addTransaction,
    onClose,
    stakingTokenContract,
    connex,
    vaultOption,
  ])

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'approve') {
      setStep('info')
    }
  }, [step, onClose])

  const body = useMemo(() => {
    switch (step) {
      case 'info':
        return (
          <ApproveModalInfo
            vaultOption={vaultOption}
            stakingPoolData={stakingPoolData}
            onApprove={() => {
              handleApprove();
            }}
          />
        );
      case 'approve':
      case 'approving':
        return (
          <>
            <BaseModalContentColumn marginTop={8}>
              <Title>
                {step === "approve"
                  ? "CONFIRM Approval"
                  : "TRANSACTION PENDING"}
              </Title>
            </BaseModalContentColumn>
            <FloatingContainer>
              <TrafficLight active={step === "approving"} />
            </FloatingContainer>
            {step === "approve" ? (
              <BaseModalContentColumn marginTop="auto">
                <PrimaryText className="mb-2">
                  Confirm this transaction in your wallet
                </PrimaryText>
              </BaseModalContentColumn>
            ) : txId ? (
              <BaseModalContentColumn marginTop="auto">
                <BaseUnderlineLink
                  href={`${getExploreURI()}/transactions/${txId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="d-flex"
                >
                  <PrimaryText className="mb-2">View on Explorer</PrimaryText>
                </BaseUnderlineLink>
              </BaseModalContentColumn>
            ) : null}
          </>
        );
    }
  }, [step, vaultOption, handleApprove, txId, stakingPoolData])

  const modalHeight = useMemo(() => {
    if (step === 'info') {
      return stakingPoolData.userData.unstakedBalance.isZero() ? 476 : 504
    }

    return 424
  }, [stakingPoolData, step])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={modalHeight}
      animationProps={{
        key: step,
        transition: {
          duration: 0.25,
          type: "keyframes",
          ease: "easeInOut",
        },
        initial:
          step === "info" || step === "approve"
            ? {
                y: -200,
                opacity: 0,
              }
            : {},
        animate:
          step === "info" || step === "approve"
            ? {
                y: 0,
                opacity: 1,
              }
            : {},
        exit:
          step === "info"
            ? {
                y: 200,
                opacity: 0,
              }
            : {},
      }}
      headerBackground={step !== 'info'}
    >
      {body}
    </Modal>

  )
}
