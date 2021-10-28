import { useCallback, useState, useMemo } from 'react'
import { find } from 'lodash'

import IERC20 from '../../constants/abis/IERC20.json'
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
import {REWARDS_ADDRESSES} from "../../constants";

export default function ApproveModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions()
  const { connex, account, stakingTokenContract } = useAppContext()

  const [step, setStep] = useState('info')

  const [txId, setTxId] = useState('');

  const handleApprove = useCallback(async () => {
    if (!stakingTokenContract) {
      return
    }

    const approveABI = find(IERC20.abi, { name: 'approve' })
    const method = stakingTokenContract.method(approveABI)
    const amount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    const clause = method.asClause(REWARDS_ADDRESSES.testnet, amount)

    setStep('approve')

    try {
      const response = await connex.vendor
        .sign('tx', [clause])
        .signer(account) // This modifier really necessary?
        .gas(2000000) // This is the maximum
        .comment('Sign to approve spending of your LP tokens')
        .request()

      const txhash = response.txid

      setStep('approving')
      setTxId(txhash)

      addTransaction({
        txhash,
        type: 'stakingApproval',
        amount: amount,
        stakeAsset: vaultOption,
      })

      const txVisitor = connex.thor.transaction(txhash)
      const ticker = connex.thor.ticker()

      await ticker.next()
      await txVisitor.getReceipt()
      setStep('info')
      setTxId('')
      onClose()
    } catch (err) {
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
            ) : (
              <BaseModalContentColumn marginTop="auto">
                <BaseUnderlineLink
                  href={`${getExploreURI()}/transactions/${txId}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="d-flex"
                >
                  <PrimaryText className="mb-2">View on Explore</PrimaryText>
                </BaseUnderlineLink>
              </BaseModalContentColumn>
            )}
          </>
        );
    }
  }, [step, vaultOption, handleApprove, txId, stakingPoolData])

  const modalHeight = useMemo(() => {
    if (step === 'info') {
      return stakingPoolData.unstakedBalance.isZero() ? 476 : 504
    }

    return 424
  }, [stakingPoolData, step])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={modalHeight}
      headerBackground={step !== 'info'}
    >
      {body}
    </Modal>

  )
}
