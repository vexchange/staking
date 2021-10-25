import { useCallback, useState, useMemo } from 'react'
import { find } from 'lodash'

import IERC20 from '../../constants/abis/IERC20.json'
import { getExploreURI } from '../../utils'

import {
  Title,
  BaseModalContentColumn,
  FloatingContainer,
} from '../../design'

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'

import Modal from '../Modal'
import ApproveModalInfo from '../ApproveModalInfo'

export default function ApproveModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addPendingTransaction } = useTransactions()
  const { connex } = useAppContext()
  const tokenContract = null

  const [step, setStep] = useState('info')
  const [txId, setTxId] = useState('');

  // const abi = find(IERC20, { name: 'approve' })
  // const method = connex.thor.account(amountToApprove?.token?.address).method(abi)

  const handleApprove = useCallback(async () => {
    if (!tokenContract) {
      return
    }

    setStep('approve')
    const amount =
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

    try {
      const tx = await tokenContract.approve(
        VaultLiquidityMiningMap[vaultOption],
        amount
      )

      setStep('approving')

      const txhash = tx.hash

      setTxId(txhash)
      addPendingTransaction({
        txhash,
        type: 'stakingApproval',
        amount: amount,
        stakeAsset: vaultOption,
      })

      // Wait for transaction to be approved
      await provider.waitForTransaction(txhash, 5)
      setStep('info')
      setTxId('')
      onClose()
    } catch (err) {
      setStep('info')
    }
  }, [addPendingTransaction, onClose, tokenContract, connex, vaultOption])

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
        );
    }
  }, [step, vaultOption, handleApprove, txId, stakingPoolData]);

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
